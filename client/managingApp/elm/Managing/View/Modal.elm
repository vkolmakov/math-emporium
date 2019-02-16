module Managing.View.Modal exposing
    ( Modal(..)
    , ModalContentDisplayState(..)
    , getModalElementId
    , remoteDataToModalContentDisplayState
    , viewModal
    )

import Html as H exposing (Html)
import Html.Attributes as A
import Managing.Styles as Styles
import Managing.Utils.RemoteData as RemoteData exposing (RemoteData)


{-| Generally used to have a better control over modal loading state
and the height it has. Hiding the content for a little bit of time
right after the data was requested, but before it has either returned
or has been deemed to be taking too long to load gives us a more fluid
transition between modal states that does not include flashing of the unpopulated
modal in the time when the data goes from Requested to (Available|Error|StillLoading)
state.
-}
type ModalContentDisplayState
    = DisplayContent
    | HideContent


remoteDataToModalContentDisplayState : RemoteData a -> ModalContentDisplayState
remoteDataToModalContentDisplayState x =
    case x of
        RemoteData.StillLoading ->
            DisplayContent

        RemoteData.Error _ ->
            DisplayContent

        RemoteData.Available _ ->
            DisplayContent

        _ ->
            HideContent


type Modal
    = ScheduledAppointmentDetailsModal
    | AppointmentDiagnosticDataModal


getModalElementId modal =
    case modal of
        ScheduledAppointmentDetailsModal ->
            "scheduled-appointment-details-modal"

        AppointmentDiagnosticDataModal ->
            "appointment-diagnostic-data-modal"


viewModal : Modal -> ModalContentDisplayState -> List (Html msg) -> Html msg
viewModal modal modalContentDisplayState content =
    let
        modalStyles =
            case modalContentDisplayState of
                DisplayContent ->
                    [ Styles.modal.self ]

                HideContent ->
                    [ Styles.modal.self, Styles.modal.contentOffPage ]
    in
    H.node "dialog"
        [ A.id (getModalElementId modal)
        , Styles.apply modalStyles
        ]
        content
