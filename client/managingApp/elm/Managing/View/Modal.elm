module Managing.View.Modal exposing (Modal(..), getModalElementId, viewModal)

import Html as H exposing (Html)
import Html.Attributes as A
import Managing.Styles as Styles


type Modal
    = ScheduledAppointmentDetailsModal
    | AppointmentDiagnosticDataModal


getModalElementId modal =
    case modal of
        ScheduledAppointmentDetailsModal ->
            "scheduled-appointment-details-modal"

        AppointmentDiagnosticDataModal ->
            "appointment-diagnostic-data-modal"


viewModal : Modal -> List (Html msg) -> Html msg
viewModal modal content =
    H.node "dialog"
        [ A.id (getModalElementId modal)
        , Styles.apply [ Styles.modal.self ]
        ]
        content
