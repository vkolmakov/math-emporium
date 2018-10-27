module Managing.View.Loading exposing (..)

import Html.Styled as H exposing (Html)
import Managing.Styles as Styles


spinner : Html msg
spinner =
    H.div [ Styles.loadingSpinnerContainer ]
        [ H.div [ Styles.loadingSpinner ] []
        ]
