port module Managing.Events.Page.EventList exposing (Model, Msg, OutMsg(..), init, initCmd, update, view)

import Html.Styled as H exposing (Html)
import Html.Styled.Attributes as A
import Html.Styled.Events as E
import Http
import Json.Decode as Json
import Managing.AppConfig exposing (AppConfig)
import Managing.Request.RemoteData as RemoteData exposing (RemoteData)
import Managing.Styles as Styles
import Managing.Utils.Date as Date exposing (Date)
import Managing.View.DataTable as DataTable
import Managing.View.Loading exposing (spinner)


scheduledAppointmentDetailsModalElementId =
    "scheduled-appointment-details-modal"



-- MODEL


type EventData
    = EventDataWithAppointment AppointmentRef


type alias EventListEntry =
    { kind : EventKind
    , user : { email : String }
    , createdAt : Date
    , data : Maybe EventData
    }


type alias AppointmentRef =
    { id : Int }


type alias AppointmentDetail =
    { id : Int
    , courseCode : String
    , locationName : String
    , timestamp : Date
    , userEmail : String
    }


type alias Model =
    { appConfig : AppConfig
    , events : RemoteData (List EventListEntry)
    , displayedEventAppointmentDetail : RemoteData AppointmentDetail
    }


type OutMsg
    = RequestShowModalById String


type EventKind
    = RemoveAppointment
    | ScheduleAppointment
    | SignIn


init appConfig =
    Model appConfig RemoteData.Requested RemoteData.NotRequested


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
    | ReceiveAppointmentDetail (Result Http.Error AppointmentDetail)
    | CheckIfRequestTakesTooLong
    | ShowScheduledAppointmentDetails Int
    | CloseScheduledAppointmentDetails


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


update : Msg -> Model -> ( Model, Cmd Msg, Maybe OutMsg )
update msg model =
    case msg of
        ReceiveEvents (Ok events) ->
            ( { model | events = RemoteData.Available events }, Cmd.none, Nothing )

        ReceiveEvents (Err e) ->
            ( { model | events = RemoteData.Error (RemoteData.errorFromHttpError e) }, Cmd.none, Nothing )

        ReceiveAppointmentDetail (Ok appointmentDetail) ->
            ( { model | displayedEventAppointmentDetail = RemoteData.Available appointmentDetail }
            , Cmd.none
            , Nothing
            )

        ReceiveAppointmentDetail (Err e) ->
            ( { model | displayedEventAppointmentDetail = RemoteData.Error (RemoteData.errorFromHttpError e) }
            , Cmd.none
            , Nothing
            )

        CheckIfRequestTakesTooLong ->
            case model.events of
                RemoteData.Requested ->
                    ( { model | events = RemoteData.StillLoading }, Cmd.none, Nothing )

                _ ->
                    ( model, Cmd.none, Nothing )

        ShowScheduledAppointmentDetails appointmentId ->
            ( { model | displayedEventAppointmentDetail = RemoteData.Requested }
            , getAppointmentDetail appointmentId
            , Just <| RequestShowModalById scheduledAppointmentDetailsModalElementId
            )

        CloseScheduledAppointmentDetails ->
            ( model, Cmd.none, Nothing )



-- VIEW


view : Model -> Html Msg
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

                actions =
                    case ( event.kind, event.data ) of
                        ( ScheduleAppointment, Just (EventDataWithAppointment appointmentDetail) ) ->
                            [ DataTable.actionLink "Details" (E.onClick <| ShowScheduledAppointmentDetails appointmentDetail.id) ]

                        _ ->
                            []
            in
            DataTable.item (fields ++ [ DataTable.actionContainer actions ])
    in
    case model.events of
        RemoteData.NotRequested ->
            H.div [] []

        RemoteData.Requested ->
            H.div [] []

        RemoteData.StillLoading ->
            spinner

        RemoteData.Available events ->
            H.div []
                [ viewScheduledAppointmentDetailModal model.appConfig model.displayedEventAppointmentDetail
                , DataTable.table (events |> List.map viewEventRow)
                ]

        RemoteData.Error e ->
            H.div [] [ H.text <| "An error occurred: " ++ RemoteData.errorToString e ]


viewScheduledAppointmentDetailModal : AppConfig -> RemoteData AppointmentDetail -> Html Msg
viewScheduledAppointmentDetailModal appConfig maybeAppointmentDetail =
    let
        modalChildren =
            case maybeAppointmentDetail of
                RemoteData.Available appointmentDetail ->
                    let
                        labelsWithData =
                            [ ( "ID", String.fromInt appointmentDetail.id )
                            , ( "User", appointmentDetail.userEmail )
                            , ( "Appointment Time", Date.toDisplayString appConfig.localTimezoneOffsetInMinutes appointmentDetail.timestamp )
                            , ( "Location", appointmentDetail.locationName )
                            , ( "Course", appointmentDetail.courseCode )
                            ]
                    in
                    [ labelsWithData
                        |> List.map (\( label, entry ) -> DataTable.textField label entry)
                        |> DataTable.item
                    ]

                RemoteData.StillLoading ->
                    [ spinner ]

                RemoteData.Error e ->
                    [ H.text <| "An error occurred: " ++ RemoteData.errorToString e ]

                _ ->
                    []
    in
    viewModal scheduledAppointmentDetailsModalElementId
        [ H.div [] modalChildren ]


viewModal id children =
    H.node "dialog" [ A.id id, Styles.apply [ Styles.dialog.self ] ] children



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


decodeEventData : Json.Decoder EventData
decodeEventData =
    let
        decodeEventAppointmentRef =
            Json.map (EventDataWithAppointment << AppointmentRef)
                (Json.field "id" Json.int)
    in
    Json.oneOf [ Json.field "appointment" decodeEventAppointmentRef ]


decodeEvent : Json.Decoder EventListEntry
decodeEvent =
    Json.map4 EventListEntry
        (Json.field "type" Json.int |> Json.andThen decodeEventKind)
        (Json.at [ "user", "email" ] Json.string |> Json.andThen decodeEventUser)
        (Json.field "createdAtTimestamp" Json.int |> Json.andThen Date.decodeTimestamp)
        (Json.maybe (Json.field "data" decodeEventData))


decodeAppointmentDetail : Json.Decoder AppointmentDetail
decodeAppointmentDetail =
    Json.map5 AppointmentDetail
        (Json.field "id" Json.int)
        (Json.field "course" Json.string)
        (Json.field "location" Json.string)
        (Json.field "timestamp" Json.int |> Json.andThen Date.decodeTimestamp)
        (Json.field "user" Json.string)


getAppointmentDetail appointmentId =
    let
        url =
            "/api/admin/scheduled-appointments/" ++ String.fromInt appointmentId
    in
    Http.send ReceiveAppointmentDetail (Http.get url decodeAppointmentDetail)


getEvents : Cmd Msg
getEvents =
    let
        url =
            "/api/events/latest?count=150"
    in
    Http.send ReceiveEvents (Http.get url (decodeEvent |> Json.list))
