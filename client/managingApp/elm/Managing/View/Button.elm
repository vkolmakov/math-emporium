module Managing.View.Button exposing (viewBase, viewLoading)

import Html.Styled as H
import Html.Styled.Attributes as A
import Html.Styled.Events as E
import Managing.Styles as Styles
import Managing.View.Loading as Loading


viewBase label msg =
    H.button [ Styles.primaryButton, E.onClick msg ] [ H.text label ]


viewLoading label =
    H.button [ A.attribute "data-text" label, Styles.primaryButton ] [ Loading.viewInlineSpinner ]
