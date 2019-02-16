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
import Managing.Shared.Data.Appointment
    exposing
        ( Appointment(..)
        , appointmentStateToString
        , decodeAppointment
        , getAppointmentRecord
        )
import Managing.Styles as Styles
import Managing.Utils.Date as Date exposing (Date)
import Managing.Utils.RemoteData as RemoteData exposing (RemoteData)
import Managing.View.Button as Button
import Managing.View.DataTable as DataTable
import Managing.View.Loading exposing (spinner)
import Managing.View.Modal as Modal exposing (Modal)
import Managing.View.PageMessage as PageMessage
import Managing.View.RemoteData exposing (viewItemList)



-- MODEL


type alias Model =
    { appConfig : AppConfig
    , appointments : RemoteData (List Appointment)
    , displayedDiagnosticDataEntry :
        Maybe (RemoteData AppointmentDiagnosticData)
    }


type CourseCode
    = CourseCode String


type StudentName
    = StudentName String


type TutorName
    = TutorName String


type CalendarEventSummary
    = CalendarEventSummary String


type alias DiagnosticEntryAppointment =
    { course : CourseCode, student : StudentName, tutor : TutorName }


type alias AppointmentDiagnosticData =
    { time : Date
    , presentCalendarEvents : List CalendarEventSummary
    , derivedAppointments : List DiagnosticEntryAppointment
    , derivedScheduledTutors : List TutorName
    , derivedAvailableTutors : List TutorName
    , selectedTutor : TutorName
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
            -- Keep the displayedDiagnosticDataEntry unchanged to avoid flashing
            -- an empty container just before the modal will be actually closed.
            ( model
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
viewAppointmentListEntry appConfig appointment =
    let
        { id, user, time, course, location } =
            getAppointmentRecord appointment

        appointmentStateDisplay =
            appointmentStateToString appointment
    in
    DataTable.item
        [ DataTable.textField "User" user
        , DataTable.textField "Time" (Date.toDisplayString appConfig.localTimezoneOffsetInMinutes time)
        , DataTable.textField "Location" location
        , DataTable.textField "Course" course
        , DataTable.textField "State" appointmentStateDisplay
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
                    [ PageMessage.viewPageMessage (PageMessage.Error err) ]

                Just RemoteData.StillLoading ->
                    [ spinner ]

                Just (RemoteData.Available diagnosticData) ->
                    let
                        { time, presentCalendarEvents, derivedAppointments, derivedScheduledTutors, derivedAvailableTutors, selectedTutor } =
                            diagnosticData

                        presentCalendarEventsText =
                            presentCalendarEvents
                                |> List.map (\(CalendarEventSummary summary) -> summary)
                                |> String.join "\n"
                                |> DataTable.sourceCodeFromString

                        derivedAppointmentToString { course, student, tutor } =
                            case ( course, student, tutor ) of
                                ( CourseCode c, StudentName s, TutorName t ) ->
                                    String.join "; " [ "Tutor: " ++ t, "Student: " ++ s, "Course: " ++ c ]

                        derivedAppointmentsText =
                            derivedAppointments
                                |> List.map derivedAppointmentToString
                                |> String.join "\n"
                                |> DataTable.sourceCodeFromString

                        getTutorListText tutorList =
                            tutorList
                                |> List.map (\(TutorName name) -> name)
                                |> String.join "\n"
                                |> DataTable.sourceCodeFromString

                        getSelectedTutorText (TutorName name) =
                            DataTable.sourceCodeFromString name
                    in
                    [ DataTable.item
                        [ DataTable.textField "Time" (Date.toDisplayString appConfig.localTimezoneOffsetInMinutes time)
                        , DataTable.sourceCodeField "Present Calendar Events" presentCalendarEventsText
                        , DataTable.sourceCodeField "Derived Appointments" derivedAppointmentsText
                        , DataTable.sourceCodeField "Derived Scheduled Tutors" (getTutorListText derivedScheduledTutors)
                        , DataTable.sourceCodeField "Derived Available Tutors" (getTutorListText derivedAvailableTutors)
                        , DataTable.sourceCodeField "Selected Tutor" (getSelectedTutorText selectedTutor)
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
    let
        decodeCalendarEventName =
            Json.field "summary" (Json.map CalendarEventSummary Json.string)

        decodeDerivedAppointment =
            Json.map3 DiagnosticEntryAppointment
                (Json.field "course" (Json.map CourseCode Json.string))
                (Json.field "student" (Json.map StudentName Json.string))
                (Json.field "tutor" (Json.map TutorName Json.string))

        decodeTutorName =
            Json.field "name" (Json.map TutorName Json.string)
    in
    Json.map6 AppointmentDiagnosticData
        (Json.field "timestamp" Json.int |> Json.andThen Date.decodeTimestamp)
        (Json.at [ "calendarState", "events" ] (Json.list decodeCalendarEventName))
        (Json.at [ "derivedItems", "appointments" ] (Json.list decodeDerivedAppointment))
        (Json.at [ "derivedItems", "scheduledTutors" ] (Json.list decodeTutorName))
        (Json.at [ "derivedItems", "availableTutors" ] (Json.list decodeTutorName))
        (Json.field "selectedTutor" decodeTutorName)
