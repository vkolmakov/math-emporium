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
import Managing.Utils.Date as Date exposing (Date)
import Managing.Utils.RemoteData as RemoteData exposing (RemoteData)
import Managing.View.DataTable as DataTable
import Managing.View.RemoteData exposing (viewItemList)



-- MODEL


type alias Model =
    { appConfig : AppConfig
    , appointments : RemoteData (List AppointmentListEntry)
    }


type alias AppointmentListEntry =
    { id : Int }


init : AppConfig -> Model
init appConfig =
    { appConfig = appConfig
    , appointments = RemoteData.Requested
    }



-- UPDATE


type Msg
    = NoOp
    | ReceiveAppointments (Result Http.Error (List AppointmentListEntry))
    | CheckIfTakingTooLong RemoteRequestItem
    | RetryInit


type OutMsg
    = NoOutMsg


type RemoteRequestItem
    = AppointmentsRequest


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

        CheckIfTakingTooLong AppointmentsRequest ->
            ( { model | appointments = RemoteData.checkIfTakingTooLong model.appointments }
            , Cmd.none
            , Nothing
            )

        RetryInit ->
            let
                initialModel =
                    init model.appConfig
            in
            ( initialModel, initCmd initialModel, Nothing )

        NoOp ->
            noOp



-- VIEW


view model =
    viewItemList model.appointments viewAppointmentListEntry RetryInit


viewAppointmentListEntry : AppointmentListEntry -> Html msg
viewAppointmentListEntry appointment =
    DataTable.item
        [ DataTable.textField "ID" (String.fromInt appointment.id)
        ]



-- HTTP


getAppointments =
    let
        url =
            "/api/admin/scheduled-appointments"
    in
    Http.send ReceiveAppointments (Http.get url (decodeAppointment |> Json.list))


decodeAppointment =
    Json.map AppointmentListEntry
        (Json.field "id" Json.int)
