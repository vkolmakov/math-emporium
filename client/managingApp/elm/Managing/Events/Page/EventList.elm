port module Managing.Events.Page.EventList exposing (Model, Msg, OutMsg(..), init, initCmd, update, view)

import Html as H exposing (Html)
import Html.Attributes as A
import Html.Events as E
import Http
import Json.Decode as Json
import Managing.AppConfig exposing (AppConfig)
import Managing.Shared.Data.Appointment exposing (Appointment, AppointmentRef, decodeAppointment, decodeAppointmentRef)
import Managing.Styles as Styles
import Managing.Utils.Date as Date exposing (Date)
import Managing.Utils.RemoteData as RemoteData exposing (RemoteData)
import Managing.View.Button as Button
import Managing.View.DataTable as DataTable
import Managing.View.Loading exposing (spinner)
import Managing.View.PageError as PageError
import Managing.View.RemoteData exposing (viewItemList)


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


type alias Model =
    { appConfig : AppConfig
    , events : RemoteData (List EventListEntry)
    , displayedEventAppointmentDetail :
        { data : RemoteData Appointment
        , id : Maybe Int
        }
    }


type EventKind
    = RemoveAppointment
    | ScheduleAppointment
    | SignIn


init appConfig =
    Model appConfig RemoteData.Requested { data = RemoteData.NotRequested, id = Nothing }


eventKindToString eventKind =
    case eventKind of
        RemoveAppointment ->
            "Remove Appointment"

        ScheduleAppointment ->
            "Schedule Appointment"

        SignIn ->
            "Sign In"



-- UPDATE


type RemoteRequestItem
    = EventListRequest
    | ScheduledAppointmentDetailsRequest


type Msg
    = ReceiveEvents (Result Http.Error (List EventListEntry))
    | ReceiveAppointmentDetail (Result Http.Error Appointment)
    | CheckIfTakingTooLong RemoteRequestItem
    | ShowScheduledAppointmentDetails Int
    | CloseScheduledAppointmentDetails
    | Retry RemoteRequestItem


type OutMsg
    = RequestShowModalById String
    | RequestCloseModalById String


initCmd : Model -> Cmd Msg
initCmd model =
    let
        fetchData =
            Cmd.batch
                [ getEvents
                , RemoteData.scheduleLoadingStateTrigger (CheckIfTakingTooLong EventListRequest)
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
    let
        setAppointmentData =
            setDataField model.displayedEventAppointmentDetail

        initialModel =
            init model.appConfig

        requestAppointmentDetails appointmentId =
            Cmd.batch
                [ RemoteData.scheduleLoadingStateTrigger (CheckIfTakingTooLong ScheduledAppointmentDetailsRequest)
                , getAppointmentDetail appointmentId
                ]
    in
    case msg of
        ReceiveEvents (Ok events) ->
            ( { model | events = RemoteData.Available events }, Cmd.none, Nothing )

        ReceiveEvents (Err e) ->
            ( { model | events = RemoteData.Error (RemoteData.errorFromHttpError e) }, Cmd.none, Nothing )

        ReceiveAppointmentDetail (Ok appointmentDetail) ->
            ( { model | displayedEventAppointmentDetail = setAppointmentData (RemoteData.Available appointmentDetail) }
            , Cmd.none
            , Nothing
            )

        ReceiveAppointmentDetail (Err e) ->
            ( { model | displayedEventAppointmentDetail = setAppointmentData (RemoteData.Error <| RemoteData.errorFromHttpError e) }
            , Cmd.none
            , Nothing
            )

        CheckIfTakingTooLong EventListRequest ->
            ( { model | events = RemoteData.checkIfTakingTooLong model.events }, Cmd.none, Nothing )

        CheckIfTakingTooLong ScheduledAppointmentDetailsRequest ->
            let
                checkIfAppointmentDataTakingTooLong =
                    setAppointmentData << RemoteData.checkIfTakingTooLong
            in
            ( { model | displayedEventAppointmentDetail = checkIfAppointmentDataTakingTooLong model.displayedEventAppointmentDetail.data }
            , Cmd.none
            , Nothing
            )

        ShowScheduledAppointmentDetails appointmentId ->
            ( { model | displayedEventAppointmentDetail = { data = RemoteData.Requested, id = Just appointmentId } }
            , requestAppointmentDetails appointmentId
            , Just <| RequestShowModalById scheduledAppointmentDetailsModalElementId
            )

        Retry EventListRequest ->
            ( initialModel, initCmd initialModel, Nothing )

        Retry ScheduledAppointmentDetailsRequest ->
            case model.displayedEventAppointmentDetail.id of
                Just appointmentId ->
                    ( { model | displayedEventAppointmentDetail = setAppointmentData RemoteData.Requested }
                    , requestAppointmentDetails appointmentId
                    , Nothing
                    )

                Nothing ->
                    ( model, Cmd.none, Nothing )

        CloseScheduledAppointmentDetails ->
            ( { model | displayedEventAppointmentDetail = initialModel.displayedEventAppointmentDetail }
            , Cmd.none
            , Just <| RequestCloseModalById scheduledAppointmentDetailsModalElementId
            )


setDataField record data =
    { record | data = data }



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
    H.div
        []
        [ viewScheduledAppointmentDetailModal model.appConfig model.displayedEventAppointmentDetail
        , viewItemList model.events viewEventRow (Retry EventListRequest)
        ]


viewScheduledAppointmentDetailModal : AppConfig -> { data : RemoteData Appointment, id : Maybe Int } -> Html Msg
viewScheduledAppointmentDetailModal appConfig { data, id } =
    let
        closeModalButton =
            Button.view "Close" "modal-close-button" Button.Enabled CloseScheduledAppointmentDetails

        contentChildren =
            case ( data, id ) of
                ( RemoteData.Available appointmentDetail, Just appointmentId ) ->
                    let
                        labelsWithData =
                            [ ( "ID", String.fromInt appointmentDetail.id )
                            , ( "User", appointmentDetail.user )
                            , ( "Appointment Time", Date.toDisplayString appConfig.localTimezoneOffsetInMinutes appointmentDetail.time )
                            , ( "Location", appointmentDetail.location )
                            , ( "Course", appointmentDetail.course )
                            ]

                        fields =
                            labelsWithData
                                |> List.map (\( label, entry ) -> DataTable.textField label entry)

                        item =
                            DataTable.item fields
                    in
                    [ item ]

                ( RemoteData.StillLoading, _ ) ->
                    [ spinner ]

                ( RemoteData.Error err, _ ) ->
                    [ PageError.viewPageError (Retry ScheduledAppointmentDetailsRequest) err ]

                _ ->
                    []

        modalContent =
            [ H.div
                [ Styles.apply [ Styles.modal.scheduledAppointmentDetailsModalContent.self ] ]
                [ H.div [ Styles.apply [ Styles.modal.scheduledAppointmentDetailsModalContent.mainContainer ] ]
                    contentChildren
                , H.div [ Styles.apply [ Styles.modal.scheduledAppointmentDetailsModalContent.closeButton ] ]
                    [ closeModalButton ]
                ]
            ]
    in
    viewModal scheduledAppointmentDetailsModalElementId modalContent


viewModal id content =
    H.node "dialog"
        [ A.id id
        , Styles.apply [ Styles.modal.self ]
        ]
        content



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
    Json.oneOf
        [ Json.field "appointment" decodeAppointmentRef |> Json.map EventDataWithAppointment ]


decodeEvent : Json.Decoder EventListEntry
decodeEvent =
    Json.map4 EventListEntry
        (Json.field "type" Json.int |> Json.andThen decodeEventKind)
        (Json.at [ "user", "email" ] Json.string |> Json.andThen decodeEventUser)
        (Json.field "createdAtTimestamp" Json.int |> Json.andThen Date.decodeTimestamp)
        (Json.maybe (Json.field "data" decodeEventData))


getAppointmentDetail appointmentId =
    let
        url =
            "/api/admin/scheduled-appointments/" ++ String.fromInt appointmentId
    in
    Http.send ReceiveAppointmentDetail (Http.get url decodeAppointment)


getEvents : Cmd Msg
getEvents =
    let
        url =
            "/api/events/latest?count=150"
    in
    Http.send ReceiveEvents (Http.get url (decodeEvent |> Json.list))
