module Managing.Appointments.Page.AppointmentList exposing
    ( Model
    , Msg
    , OutMsg(..)
    , init
    , initCmd
    , update
    , view
    )

import Html as H exposing (Html)
import Html.Events as E
import Http
import Json.Decode as Json
import Managing.AppConfig exposing (AppConfig)
import Managing.Shared.Data.Appointment exposing (Appointment, decodeAppointment)
import Managing.Styles as Styles
import Managing.Utils.Date as Date exposing (Date)
import Managing.Utils.RemoteData as RemoteData exposing (RemoteData)
import Managing.View.Button as Button
import Managing.View.DataTable as DataTable
import Managing.View.Loading exposing (spinner)
import Managing.View.Modal as Modal exposing (Modal)
import Managing.View.PageError as PageError
import Managing.View.RemoteData exposing (viewItemList)



-- MODEL


type alias Model =
    { appConfig : AppConfig
    , appointments : RemoteData (List Appointment)
    , displayedDiagnosticDataEntry :
        Maybe (RemoteData AppointmentDiagnosticData)
    }


type alias AppointmentDiagnosticData =
    { time : Date

    -- TODO: add more fields
    }


init : AppConfig -> Model
init appConfig =
    { appConfig = appConfig
    , appointments = RemoteData.Requested
    , displayedDiagnosticDataEntry = Nothing
    }



-- UPDATE


type Msg
    = NoOp
    | ReceiveAppointments (Result Http.Error (List Appointment))
    | ReceiveAppointmentDiagnosticData Int (Result Http.Error AppointmentDiagnosticData)
    | ShowAppointmentDiagnosticData Int
    | CloseAppointmentDiagnosticData
    | CheckIfTakingTooLong RemoteRequestItem
    | Retry RemoteRequestItem


type OutMsg
    = RequestShowModal Modal
    | RequestCloseModal Modal


type RemoteRequestItem
    = AppointmentsRequest
    | AppointmentDiagnosticDataRequest Int


initCmd : Model -> Cmd Msg
initCmd model =
    let
        fetchData =
            Cmd.batch
                [ getAppointments
                , RemoteData.scheduleLoadingStateTrigger (CheckIfTakingTooLong AppointmentsRequest)
                ]
    in
    case model.appointments of
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
        noOp =
            ( model, Cmd.none, Nothing )

        requestAppointmentDiagnosticData appointmentId =
            Cmd.batch
                [ getAppointmentDiagnosticData appointmentId
                , RemoteData.scheduleLoadingStateTrigger (CheckIfTakingTooLong <| AppointmentDiagnosticDataRequest appointmentId)
                ]
    in
    case msg of
        ReceiveAppointments (Ok appointments) ->
            ( { model | appointments = RemoteData.Available appointments }, Cmd.none, Nothing )

        ReceiveAppointments (Err e) ->
            ( { model | appointments = RemoteData.Error (RemoteData.errorFromHttpError e) }
            , Cmd.none
            , Nothing
            )

        ReceiveAppointmentDiagnosticData appointmentId (Ok diagnosticData) ->
            ( { model | displayedDiagnosticDataEntry = Just (RemoteData.Available diagnosticData) }
            , Cmd.none
            , Nothing
            )

        ReceiveAppointmentDiagnosticData appointmentId (Err e) ->
            let
                updatedDiagnosticDataEntry =
                    Just (e |> RemoteData.errorFromHttpError |> RemoteData.Error)
            in
            ( { model | displayedDiagnosticDataEntry = updatedDiagnosticDataEntry }
            , Cmd.none
            , Nothing
            )

        CheckIfTakingTooLong AppointmentsRequest ->
            ( { model | appointments = RemoteData.checkIfTakingTooLong model.appointments }
            , Cmd.none
            , Nothing
            )

        CheckIfTakingTooLong (AppointmentDiagnosticDataRequest _) ->
            let
                updatedDisplayedDiagnosticDataEntry =
                    model.displayedDiagnosticDataEntry
                        |> Maybe.map RemoteData.checkIfTakingTooLong
            in
            ( { model | displayedDiagnosticDataEntry = updatedDisplayedDiagnosticDataEntry }
            , Cmd.none
            , Nothing
            )

        ShowAppointmentDiagnosticData appointmentId ->
            ( { model | displayedDiagnosticDataEntry = Just RemoteData.Requested }
            , requestAppointmentDiagnosticData appointmentId
            , Just <| RequestShowModal Modal.AppointmentDiagnosticDataModal
            )

        CloseAppointmentDiagnosticData ->
            ( { model | displayedDiagnosticDataEntry = Nothing }
            , Cmd.none
            , Just <| RequestCloseModal Modal.AppointmentDiagnosticDataModal
            )

        Retry AppointmentsRequest ->
            let
                initialModel =
                    init model.appConfig
            in
            ( initialModel, initCmd initialModel, Nothing )

        Retry (AppointmentDiagnosticDataRequest appointmentId) ->
            ( { model | displayedDiagnosticDataEntry = Just RemoteData.Requested }
            , requestAppointmentDiagnosticData appointmentId
            , Nothing
            )

        NoOp ->
            noOp



-- VIEW


view model =
    H.div []
        [ viewItemList model.appointments (viewAppointmentListEntry model.appConfig) (Retry AppointmentsRequest)
        , viewAppointmentDiagnosticDataModal model.appConfig model.displayedDiagnosticDataEntry
        ]


viewAppointmentListEntry : AppConfig -> Appointment -> Html Msg
viewAppointmentListEntry appConfig { id, user, time, course, location } =
    DataTable.item
        [ DataTable.textField "User" user
        , DataTable.textField "Time" (Date.toDisplayString appConfig.localTimezoneOffsetInMinutes time)
        , DataTable.textField "Location" location
        , DataTable.textField "Course" course
        , DataTable.actionContainer
            [ DataTable.actionLink "Diagnostic Data" (E.onClick <| ShowAppointmentDiagnosticData id) ]
        ]


viewAppointmentDiagnosticDataModal : AppConfig -> Maybe (RemoteData AppointmentDiagnosticData) -> Html Msg
viewAppointmentDiagnosticDataModal appConfig displayedDiagnosticDataEntry =
    let
        closeModalButton =
            Button.view "Close" "modal-close-button" Button.Enabled CloseAppointmentDiagnosticData

        contentChildren =
            case displayedDiagnosticDataEntry of
                Nothing ->
                    []

                Just RemoteData.Requested ->
                    []

                Just RemoteData.NotRequested ->
                    []

                Just (RemoteData.Error err) ->
                    -- TODO: add retry logic (thread appointment ID to the view)
                    [ PageError.viewPageError NoOp err ]

                Just RemoteData.StillLoading ->
                    [ spinner ]

                Just (RemoteData.Available diagnosticData) ->
                    let
                        { time } =
                            diagnosticData
                    in
                    [ DataTable.item
                        [ DataTable.textField "Time" (Date.toDisplayString appConfig.localTimezoneOffsetInMinutes time)
                        ]
                    ]

        content =
            [ H.div
                [ Styles.apply [ Styles.modal.appointmentDiagnosticDataModalContent.self ] ]
                [ H.div [ Styles.apply [ Styles.modal.appointmentDiagnosticDataModalContent.mainContainer ] ]
                    contentChildren
                , H.div [ Styles.apply [ Styles.modal.appointmentDiagnosticDataModalContent.closeButton ] ]
                    [ closeModalButton ]
                ]
            ]
    in
    Modal.viewModal Modal.AppointmentDiagnosticDataModal content



-- HTTP


getAppointments =
    let
        url =
            "/api/admin/scheduled-appointments"
    in
    Http.send ReceiveAppointments (Http.get url (decodeAppointment |> Json.list))


getAppointmentDiagnosticData id =
    let
        url =
            "/api/admin/scheduled-appointments/diagnostics/" ++ String.fromInt id
    in
    Http.send (ReceiveAppointmentDiagnosticData id) (Http.get url decodeAppointmentDiagnosticData)


decodeAppointmentDiagnosticData =
    Json.map AppointmentDiagnosticData
        (Json.field "timestamp" Json.int |> Json.andThen Date.decodeTimestamp)