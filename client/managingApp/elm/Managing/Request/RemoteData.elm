module Managing.Request.RemoteData exposing
    ( RemoteData(..)
    , RemoteDataError(..)
    , errorFromHttpError
    , errorToString
    , scheduleLoadingStateTrigger
    )

import Http
import Process
import Task


delayBeforeTooLong =
    150


scheduleLoadingStateTrigger : msg -> Cmd msg
scheduleLoadingStateTrigger msg =
    Process.sleep delayBeforeTooLong |> Task.perform (always msg)


type RemoteDataError
    = RemoteDataError Http.Error


errorFromHttpError httpError =
    RemoteDataError httpError


errorToString err =
    case err of
        RemoteDataError httpError ->
            httpErrorToString httpError


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
            response.status.message


type RemoteData a
    = NotRequested
    | Requested
    | StillLoading -- Intermediate state - data is loading for a long time after the request was made
    | Error RemoteDataError
    | Available a
