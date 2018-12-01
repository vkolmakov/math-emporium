module Managing.ErrorEvents.Page.ErrorEventList exposing (Model, Msg, OutMsg(..), init, initCmd, update, view)

import Html as H exposing (Html)
import Http
import Json.Decode as Json
import Managing.AppConfig exposing (AppConfig)
import Managing.Request.RemoteData as RemoteData exposing (RemoteData)
import Managing.Utils.Date as Date exposing (Date)
import Managing.View.DataTable as DataTable
import Managing.View.Loading exposing (spinner)



-- MODEL


type alias Model =
    { appConfig : AppConfig
    , errorEvents : RemoteData (List ErrorEventListEntry)
    }


type alias ErrorEventListEntry =
    { id : String
    , createdAt : Date
    , dataBlob : DataTable.SourceCode
    , stacktrace : DataTable.SourceCode
    , userEmail : Maybe String
    , url : String
    , query : DataTable.SourceCode
    , body : DataTable.SourceCode
    }


init : AppConfig -> Model
init appConfig =
    { appConfig = appConfig
    , errorEvents = RemoteData.Requested
    }



-- UPDATE


type Msg
    = NoOp
    | ReceiveErrorEvents (Result Http.Error (List ErrorEventListEntry))
    | CheckIfTakingTooLong RemoteRequestItem


type OutMsg
    = NoOutMsg


type RemoteRequestItem
    = ErrorEvents


initCmd : Model -> Cmd Msg
initCmd model =
    let
        fetchData =
            Cmd.batch
                [ getErrorEvents
                , RemoteData.scheduleLoadingStateTrigger (CheckIfTakingTooLong ErrorEvents)
                ]
    in
    case model.errorEvents of
        RemoteData.NotRequested ->
            fetchData

        RemoteData.Requested ->
            fetchData

        RemoteData.StillLoading ->
            Cmd.none

        RemoteData.Error _ ->
            Cmd.none

        RemoteData.Available _ ->
            Cmd.none


update : Msg -> Model -> ( Model, Cmd Msg, Maybe OutMsg )
update msg model =
    case msg of
        ReceiveErrorEvents (Ok events) ->
            ( { model | errorEvents = RemoteData.Available events }, Cmd.none, Nothing )

        ReceiveErrorEvents (Err _) ->
            ( model, Cmd.none, Nothing )

        CheckIfTakingTooLong ErrorEvents ->
            case model.errorEvents of
                RemoteData.Requested ->
                    ( { model | errorEvents = RemoteData.StillLoading }, Cmd.none, Nothing )

                _ ->
                    ( model, Cmd.none, Nothing )

        NoOp ->
            ( model, Cmd.none, Nothing )



-- VIEW


view : Model -> Html Msg
view model =
    let
        viewErrorEventRow errorEvent =
            let
                fields =
                    [ DataTable.textField "Time" (Date.toDisplayString model.appConfig.localTimezoneOffsetInMinutes errorEvent.createdAt)
                    , DataTable.textField "User" (Maybe.withDefault "None" errorEvent.userEmail)
                    , DataTable.textField "URL" errorEvent.url
                    , DataTable.sourceCodeField "Body" errorEvent.body
                    , DataTable.sourceCodeField "Query" errorEvent.query
                    , DataTable.sourceCodeField "Data" errorEvent.dataBlob
                    , DataTable.sourceCodeField "Stacktrace" errorEvent.stacktrace
                    ]
            in
            DataTable.item fields
    in
    case model.errorEvents of
        RemoteData.NotRequested ->
            H.div [] []

        RemoteData.Requested ->
            H.div [] []

        RemoteData.StillLoading ->
            spinner

        RemoteData.Available events ->
            H.div []
                [ DataTable.table (events |> List.map viewErrorEventRow)
                ]

        RemoteData.Error e ->
            H.div [] [ H.text <| "An error occurred: " ++ RemoteData.errorToString e ]



-- HTTP


decodeErrorEventListEntry =
    Json.map8 ErrorEventListEntry
        (Json.field "id" Json.string)
        (Json.field "createdAtTimestamp" Json.int |> Json.andThen Date.decodeTimestamp)
        (Json.field "dataBlob" Json.string |> Json.map DataTable.sourceCodeFromString)
        (Json.field "stacktrace" Json.string |> Json.map DataTable.sourceCodeFromString)
        (Json.field "userEmail" (Json.nullable Json.string))
        (Json.field "url" Json.string)
        (Json.field "query" Json.string |> Json.map DataTable.sourceCodeFromString)
        (Json.field "body" Json.string |> Json.map DataTable.sourceCodeFromString)


getErrorEvents : Cmd Msg
getErrorEvents =
    let
        url =
            "/api/error-events"
    in
    Http.send
        ReceiveErrorEvents
        (Http.get url (decodeErrorEventListEntry |> Json.list))
