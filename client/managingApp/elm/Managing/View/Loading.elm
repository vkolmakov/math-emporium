module Managing.View.Loading exposing (spinner, viewInlineSpinner)

import Html.Styled as H exposing (Html)
import Managing.Styles as Styles


viewInlineSpinner =
    H.div [ Styles.apply [ Styles.utility.centeredFlexContainer ] ]
        [ H.div [ Styles.apply [ Styles.loadingSpinner.self, Styles.loadingSpinner.small ] ] []
        ]


spinner : Html msg
spinner =
    H.div [ Styles.apply [ Styles.utility.centeredFlexContainer ] ]
        [ H.div [ Styles.apply [ Styles.loadingSpinner.self ] ] []
        ]
