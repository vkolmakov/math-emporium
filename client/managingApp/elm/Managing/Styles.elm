module Managing.Styles
    exposing
        ( mainContainer
        , loadingSpinner
        , loadingSpinnerContainer
        , dataTableRow
        , dataTableCellText
        , dataTableCellEditLink
        , fieldLabel
        , fieldGroup
        , fieldTextInput
        )

import Html.Styled exposing (Attribute)
import Css exposing (em, auto, px, pct, hex)
import Css.Media as Media
import Html.Styled.Attributes as A exposing (css)


defaultFontFamilies =
    [ "Open Sans", "Optima", "Helvetica", "Arial", "sans-serif" ]


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
        [ desktopStyles
            [-- TODO: add cancelation of the content rule
            ]
        , Css.before
            [ Css.property "content" "attr(data-label)\": \"" ]
        ]


dataTableCellEditLink : Attribute msg
dataTableCellEditLink =
    css []


fieldLabel =
    css
        [ Css.marginRight (em 0.5)
        ]


fieldGroup =
    css
        [ Css.displayFlex
        , Css.flexDirection Css.column
        , Css.marginBottom (em 0.75)
        ]


fieldTextInput =
    css
        [ Css.disabled
            [ Css.cursor Css.notAllowed
            ]
        , Css.fontFamilies
            defaultFontFamilies
        , Css.fontSize (em 1)
        , Css.padding (em 0.4)
        ]



-- HELPERS


desktopStyles : List Css.Style -> Css.Style
desktopStyles =
    Media.withMedia
        [ Media.only Media.screen [ Media.minWidth (px 768) ]
        ]
