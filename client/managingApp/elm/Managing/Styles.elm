module Managing.Styles
    exposing
        ( mainContainer
        , loadingSpinner
        , loadingSpinnerContainer
        , dataTableRow
        , dataTableCellText
        )

import Html.Styled exposing (Attribute)
import Css exposing (em, auto, px, pct, hex)
import Html.Styled.Attributes as A exposing (css)


mainContainer : Attribute msg
mainContainer =
    css
        [ Css.maxWidth (em 50)
        , Css.margin2 (em 0) auto
        , Css.padding (em 1)
        ]


loadingSpinner : Attribute msg
loadingSpinner =
    css
        [ Css.borderRadius (pct 50)
        , Css.width (px 24)
        , Css.height (px 24)
        , Css.border3 (Css.rem 0.25) Css.solid (hex "#d9edf9")
        , Css.borderTopColor (hex "#add3e9")
        , Css.property "animation" "spin 0.5s infinite"
        ]


loadingSpinnerContainer : Attribute msg
loadingSpinnerContainer =
    css
        [ Css.displayFlex
        , Css.justifyContent Css.center
        ]


dataTableRow : Attribute msg
dataTableRow =
    css
        [ Css.marginBottom (em 1) ]


dataTableCellText : Attribute msg
dataTableCellText =
    css
        []
