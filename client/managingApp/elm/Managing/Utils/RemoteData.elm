module Managing.Utils.RemoteData exposing
    ( RemoteData(..)
    , RemoteDataError(..)
    , checkIfTakingTooLong
    , errorFromHttpError
    , errorToString
    , map
    , scheduleLoadingStateTrigger
    , withDefault
    )

import Http
import Json.Decode as Json
import Process
import Task


delayBeforeTooLong : Float
delayBeforeTooLong =
    150


scheduleLoadingStateTrigger : msg -> Cmd msg
scheduleLoadingStateTrigger msg =
    Process.sleep delayBeforeTooLong |> Task.perform (always msg)


type alias ServerErrorObject =
    { message : String
    , status : Int
    }


type RemoteDataError
    = RemoteDataError Http.Error


type ErrorMessage
    = ErrorMessage String


type ServerError
    = InternalError
    | CannotProcessRequest ErrorMessage


errorFromHttpError : Http.Error -> RemoteDataError
errorFromHttpError httpError =
    RemoteDataError httpError


errorToString : RemoteDataError -> String
errorToString err =
    case err of
        RemoteDataError httpError ->
            httpErrorToString httpError


decodeServerError : String -> ServerError
decodeServerError errorBody =
    let
        decodeServerErrorObject =
            Json.map2
                ServerErrorObject
                (Json.field "error" Json.string)
                (Json.field "status" Json.int)

        serverErrorObjectToServerError serverErrorObject =
            case serverErrorObject.status of
                422 ->
                    CannotProcessRequest (ErrorMessage serverErrorObject.message)

                _ ->
                    InternalError
    in
    errorBody
        |> Json.decodeString (decodeServerErrorObject |> Json.map serverErrorObjectToServerError)
        |> Result.withDefault InternalError


serverErrorToString : ServerError -> String
serverErrorToString err =
    case err of
        InternalError ->
            "Internal server error"

        CannotProcessRequest (ErrorMessage message) ->
            message


httpErrorToString : Http.Error -> String
httpErrorToString err =
    case err of
        Http.NetworkError ->
            "Network Error"

        Http.BadUrl _ ->
            "Invalid request URL"

        Http.BadPayload _ _ ->
            "Invalid request data"

        Http.Timeout ->
            "Request took too long"

        Http.BadStatus response ->
            response.body
                |> decodeServerError
                |> serverErrorToString


type RemoteData a
    = NotRequested
    | Requested
    | StillLoading -- Intermediate state - data is loading for a long time after the request was made
    | Error RemoteDataError
    | Available a


map : (a -> b) -> RemoteData a -> RemoteData b
map fn val =
    case val of
        Available x ->
            Available (fn x)

        NotRequested ->
            NotRequested

        Requested ->
            Requested

        StillLoading ->
            StillLoading

        Error e ->
            Error e


withDefault : a -> RemoteData a -> a
withDefault defaultVal x =
    case x of
        Available val ->
            val

        _ ->
            defaultVal


checkIfTakingTooLong : RemoteData a -> RemoteData a
checkIfTakingTooLong val =
    case val of
        Requested ->
            StillLoading

        _ ->
            val
