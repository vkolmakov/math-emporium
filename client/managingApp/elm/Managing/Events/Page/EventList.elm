module Managing.Events.Page.EventList exposing (Model, Msg, init, initCmd, update, view)

import Html.Styled as H
import Http
import Json.Decode as Json
import Managing.AppConfig exposing (AppConfig)
import Managing.Request.RemoteData as RemoteData exposing (RemoteData)
import Managing.Utils.Date as Date exposing (Date)
import Managing.View.DataTable as DataTable
import Managing.View.Loading exposing (spinner)



-- MODEL


type alias EventListEntry =
    { kind : EventKind
    , user : { email : String }
    , createdAt : Date
    }


type alias Model =
    { appConfig : AppConfig
    , events : RemoteData (List EventListEntry)
    }


type EventKind
    = RemoveAppointment
    | ScheduleAppointment
    | SignIn


init appConfig =
    Model appConfig RemoteData.Requested


eventKindToString eventKind =
    case eventKind of
        RemoveAppointment ->
            "Remove Appointment"

        ScheduleAppointment ->
            "Schedule Appointment"

        SignIn ->
            "Sign In"



-- UPDATE


type Msg
    = ReceiveEvents (Result Http.Error (List EventListEntry))
    | CheckIfRequestTakesTooLong


initCmd : Model -> Cmd Msg
initCmd model =
    let
        fetchData =
            Cmd.batch
                [ getEvents
                , RemoteData.scheduleLoadingStateTrigger CheckIfRequestTakesTooLong
                ]
    in
    case model.events of
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


update msg model =
    case msg of
        ReceiveEvents (Ok events) ->
            ( { model | events = RemoteData.Available events }, Cmd.none, Nothing )

        ReceiveEvents (Err e) ->
            ( model, Cmd.none, Nothing )

        CheckIfRequestTakesTooLong ->
            case model.events of
                RemoteData.Requested ->
                    ( { model | events = RemoteData.StillLoading }, Cmd.none, Nothing )

                _ ->
                    ( model, Cmd.none, Nothing )



-- VIEW


view model =
    let
        viewEventRow event =
            let
                labelsWithData =
                    [ ( "Type", eventKindToString event.kind )
                    , ( "Time", Date.toDisplayString model.appConfig.localTimezoneOffsetInMinutes event.createdAt )
                    , ( "User", event.user.email )
                    ]

                fields =
                    labelsWithData
                        |> List.map (\( label, entry ) -> DataTable.textField label entry)
            in
            DataTable.item fields
    in
    case model.events of
        RemoteData.NotRequested ->
            H.div [] []

        RemoteData.Requested ->
            H.div [] []

        RemoteData.StillLoading ->
            spinner

        RemoteData.Available events ->
            DataTable.table (events |> List.map viewEventRow)

        RemoteData.Error e ->
            H.div [] [ H.text "An error occurred" ]



-- HTTP


decodeEventKind : Int -> Json.Decoder EventKind
decodeEventKind eventKindId =
    case eventKindId of
        1 ->
            Json.succeed ScheduleAppointment

        2 ->
            Json.succeed RemoveAppointment

        3 ->
            Json.succeed SignIn

        _ ->
            Json.fail "Unknown event kind"


decodeEventUser userEmail =
    Json.succeed { email = userEmail }


decodeEvent : Json.Decoder EventListEntry
decodeEvent =
    Json.map3 EventListEntry
        (Json.field "type" Json.int |> Json.andThen decodeEventKind)
        (Json.at [ "user", "email" ] Json.string |> Json.andThen decodeEventUser)
        (Json.field "createdAtTimestamp" Json.int |> Json.andThen Date.decodeTimestamp)


getEvents : Cmd Msg
getEvents =
    let
        url =
            "/api/events/latest?count=150"
    in
    Http.send ReceiveEvents (Http.get url (decodeEvent |> Json.list))
