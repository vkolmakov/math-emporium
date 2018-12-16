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
import Http
import Json.Decode as Json
import Managing.AppConfig exposing (AppConfig)
import Managing.Shared.Data.Appointment exposing (Appointment, decodeAppointment)
import Managing.Utils.Date as Date exposing (Date)
import Managing.Utils.RemoteData as RemoteData exposing (RemoteData)
import Managing.View.DataTable as DataTable
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
    | CheckIfTakingTooLong RemoteRequestItem
    | Retry RemoteRequestItem


type OutMsg
    = NoOutMsg


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
            ( { model | appointments = RemoteData.checkIfTakingTooLong model.appointments }
            , Cmd.none
            , Nothing
            )

        Retry AppointmentsRequest ->
            let
                initialModel =
                    init model.appConfig
            in
            ( initialModel, initCmd initialModel, Nothing )

        Retry (AppointmentDiagnosticDataRequest appointmentId) ->
            ( { model | displayedDiagnosticDataEntry = Just RemoteData.Requested }
            , getAppointmentDiagnosticData appointmentId
            , Nothing
            )

        NoOp ->
            noOp



-- VIEW


view model =
    viewItemList model.appointments (viewAppointmentListEntry model.appConfig) (Retry AppointmentsRequest)


viewAppointmentListEntry : AppConfig -> Appointment -> Html msg
viewAppointmentListEntry appConfig { id, user, time, course, location } =
    DataTable.item
        [ DataTable.textField "User" user
        , DataTable.textField "Time" (Date.toDisplayString appConfig.localTimezoneOffsetInMinutes time)
        , DataTable.textField "Location" location
        , DataTable.textField "Course" course
        ]



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
