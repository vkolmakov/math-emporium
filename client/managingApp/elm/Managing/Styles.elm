module Managing.Styles
    exposing
        ( mainContainer
        , loadingSpinner
        , loadingSpinnerContainer
        , sectionNavContainer
        , sectionNavItem
        , sectionNavItemLink
        , sectionNavItemLinkHighlighted
        , dataTableItem
        , dataTableField
        , dataTableEditLinkContainer
        , dataTableAction
        , dataTableFieldLabelWrapper
        , dataTableFieldLabelContent
        , dataTableFieldContentText
        , fieldLabel
        , fieldLabelHidden
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
        , Css.textDecoration Css.underline

        -- potentially override some default browser button styles
        , Css.fontSize (em 1)
        , Css.cursor (Css.pointer)
        , Css.fontFamily Css.inherit
        , Css.border (px 0)
        , Css.padding (px 0)
        , Css.backgroundColor (Css.transparent)
        ]


visuallyHidden =
    Css.batch
        [ Css.border (px 0)
        , Css.property "clip" "rect(0 0 0 0)"
        , Css.height (px 1)
        , Css.margin (px -1)
        , Css.overflow Css.hidden
        , Css.padding (px 0)
        , Css.position Css.absolute
        , Css.width (px 1)
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



-- SectionNav


sectionNavContainer =
    css
        [ Css.displayFlex
        , Css.listStyleType Css.none
        , Css.padding (px 0)
        ]


sectionNavItem =
    css
        [ Css.displayFlex
        , Css.marginRight (em 0.5)
        ]


highlightedLinkStyles =
    [ Css.fontWeight Css.bold
    , Css.backgroundColor theme.primaryColor
    ]


sectionNavItemLinkHighlighted =
    css highlightedLinkStyles


sectionNavItemLink =
    css
        [ Css.after
            -- following styles are required to make the container
            -- fill up the space as if the text was bold
            -- to avoid containers jumping around when we transition
            -- to bold text on hover/focus
            [ Css.property "content" "attr(data-text)"
            , Css.display Css.block
            , Css.fontWeight Css.bold
            , Css.overflow Css.hidden
            , Css.visibility Css.hidden
            , Css.height (px 0)
            ]
        , Css.hover highlightedLinkStyles
        , Css.focus highlightedLinkStyles

        -- individual styles
        , Css.border3 (px 1) Css.solid theme.tertiaryColor
        , Css.borderRadius (px 5)
        , Css.padding (em 0.5)
        , Css.textDecoration Css.none
        , Css.color theme.primaryTextColor
        ]



-- DataTable


dataTableFieldPadding =
    em 0.5


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
        , Css.displayFlex
        , Css.alignItems Css.center
        ]


dataTableFieldLabelContent =
    css [ Css.fontWeight Css.bold ]


dataTableFieldContentText =
    css
        [ Css.flex <| int 3
        , Css.padding dataTableFieldPadding
        ]


dataTableEditLinkContainer : Attribute msg
dataTableEditLinkContainer =
    css
        [ Css.padding dataTableFieldPadding
        , Css.displayFlex
        , Css.justifyContent Css.flexEnd
        ]


dataTableAction =
    css
        [ link

        -- because all of the actions are flex-end aligned, only left padding
        -- is needed to add some space between the actions
        , Css.paddingLeft (em 0.5)
        ]



-- Form


fieldLabel =
    css
        [ Css.marginRight (em 0.5)
        ]


fieldLabelHidden =
    css [ visuallyHidden ]


fieldGroup =
    css
        [ Css.displayFlex
        , Css.flexDirection Css.column
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
