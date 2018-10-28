module Managing.Styles
    exposing
        ( mainContainer
        , loadingSpinner
        , loadingSpinnerContainer
        , dataTableItem
        , dataTableField
        , dataTableEditLinkContainer
        , dataTableAction
        , dataTableFieldLabelWrapper
        , dataTableFieldLabelContent
        , dataTableFieldContentText
        , fieldLabel
        , fieldGroup
        , fieldTextInput
        )

import Html.Styled exposing (Attribute)
import Css exposing (em, auto, px, pct, hex, int)
import Css.Media as Media
import Html.Styled.Attributes as A exposing (css)


-- Shared


type alias Theme =
    { fontFamilies : List String
    , primaryColor : Css.Color
    , primaryColorFocused : Css.Color
    , primaryTextColor : Css.Color
    , secondaryColor : Css.Color
    , tertiaryColor : Css.Color
    }


theme : Theme
theme =
    { fontFamilies = [ "Open Sans", "Optima", "Helvetica", "Arial", "sans-serif" ]
    , primaryColor = hex "#D9EDF9"
    , primaryColorFocused = hex "#ADD3E9"
    , primaryTextColor = hex "#000000"
    , secondaryColor = hex "#FFFFFF"
    , tertiaryColor = hex "#A3A3A3"
    }


link =
    Css.batch
        [ Css.color theme.primaryTextColor
        ]



-- Top-level


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
        , Css.border3 (Css.rem 0.25) Css.solid theme.primaryColor
        , Css.borderTopColor theme.primaryColorFocused
        , Css.property "animation" "spin 0.5s infinite"
        ]


loadingSpinnerContainer : Attribute msg
loadingSpinnerContainer =
    css
        [ Css.displayFlex
        , Css.justifyContent Css.center
        ]



-- DataTable


dataTableFieldPadding =
    em 0.25


dataTableItem : Attribute msg
dataTableItem =
    css
        [ Css.marginBottom (em 1)
        ]


dataTableField : Attribute msg
dataTableField =
    css
        [ Css.firstChild
            [ Css.borderTop3 (px 1) Css.solid theme.tertiaryColor
            ]
        , Css.displayFlex
        , Css.flexDirection Css.row
        , Css.borderBottom3 (px 1) Css.solid theme.tertiaryColor
        , Css.borderLeft3 (px 1) Css.solid theme.tertiaryColor
        , Css.borderRight3 (px 1) Css.solid theme.tertiaryColor
        ]


dataTableFieldLabelWrapper =
    css
        [ Css.flex <| int 1
        , Css.borderRight3 (px 1) Css.solid theme.tertiaryColor
        , Css.padding dataTableFieldPadding
        ]


dataTableFieldLabelContent =
    css []


dataTableFieldContentText =
    css
        [ Css.flex <| int 3
        , Css.padding dataTableFieldPadding
        ]


dataTableEditLinkContainer : Attribute msg
dataTableEditLinkContainer =
    css [ Css.padding dataTableFieldPadding ]


dataTableAction =
    css [ link ]



-- Form


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
            theme.fontFamilies
        , Css.fontSize (em 1)
        , Css.padding (em 0.4)
        ]



-- HELPERS


desktopStyles : List Css.Style -> Css.Style
desktopStyles =
    Media.withMedia
        [ Media.only Media.screen [ Media.minWidth (px 768) ]
        ]
