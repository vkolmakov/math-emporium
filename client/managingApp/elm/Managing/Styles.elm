module Managing.Styles exposing
    ( applicationContainer
    , apply
    , button
    , dataList
    , detailContainer
    , dialog
    , fieldGroup
    , fieldLabel
    , fieldLabelHidden
    , fieldTextInput
    , loadingSpinner
    , marginRight
    , rightAlignedContainer
    , sectionNav
    , textColorError
    , textColorSuccess
    , utility
    )

import Css exposing (auto, em, hex, int, pct, px, vh)
import Css.Media as Media
import Html.Styled exposing (Attribute)
import Html.Styled.Attributes as A exposing (css)



-- CONVERTED


apply : List String -> Attribute msg
apply classList =
    A.class (String.join " " classList)


button =
    { primary = "m-button m-button--primary"
    , disabled = "m-button m-button--disabled"
    , loading = "m-button m-button--loading"
    , asLink = "m-button m-button--as-link"
    }


sectionNav =
    { self = "m-section-nav"
    , item = "m-section-nav__item"
    , link = "m-section-nav__link"
    , linkHighlighted = "m-section-nav__link--highlighted"
    }


applicationContainer =
    { self = "m-application-container"
    , pageContent = "m-application-container__page-content"
    }


loadingSpinner =
    { self = "m-loading-spinner"
    , small = "m-loading-spinner--small"
    }


utility =
    { centeredFlexContainer = "utility__centered-flex-container"
    , boldText = "utility__bold-text"
    }


dataList =
    { self = "m-data-list"
    , item = "m-data-list__item"
    , itemField = "m-data-list__item__field"
    , itemFieldLabel = "m-data-list__item__field__label"
    , itemFieldValue = "m-data-list__item__field__value"
    , itemActions = "m-data-list__item__actions"
    }



-- TODO
-- Shared


type alias Theme =
    { fontFamilies : List String
    , primaryColor : Css.Color
    , primaryColorFocused : Css.Color
    , primaryTextColor : Css.Color
    , secondaryColor : Css.Color
    , tertiaryColor : Css.Color
    , successColor : Css.Color
    , dangerColor : Css.Color
    }


theme : Theme
theme =
    { fontFamilies = [ "Open Sans", "Optima", "Helvetica", "Arial", "sans-serif" ]
    , primaryColor = hex "#D9EDF9"
    , primaryColorFocused = hex "#ADD3E9"
    , primaryTextColor = hex "#000000"
    , secondaryColor = hex "#FFFFFF"
    , tertiaryColor = hex "#A3A3A3"
    , successColor = hex "#296529"
    , dangerColor = hex "#B33737"
    }


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


detailContainer : Attribute msg
detailContainer =
    css []


rightAlignedContainer =
    css
        [ Css.displayFlex
        , Css.flexDirection Css.row
        , Css.justifyContent Css.flexEnd
        , Css.alignItems Css.center
        ]


textColorSuccess =
    css [ Css.color theme.successColor ]


textColorError =
    css [ Css.color theme.dangerColor ]


marginRight =
    css [ Css.marginRight (em 1) ]


dialog =
    css [ Css.position Css.fixed, Css.top (vh 25) ]



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
