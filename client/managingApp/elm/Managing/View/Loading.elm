module Managing.View.Loading exposing (spinner, viewInlineSpinner)

import Html.Styled as H exposing (Html)
import Managing.Styles as Styles


viewInlineSpinner =
    H.div [ Styles.loadingSpinnerContainer ]
        [ H.div [ Styles.loadingSpinner 0.9 ] []
        ]


spinner : Html msg
spinner =
    H.div [ Styles.loadingSpinnerContainer ]
        [ H.div [ Styles.loadingSpinner 1.5 ] []
        ]
