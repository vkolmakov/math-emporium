module Managing.Styles exposing (mainContainer, loadingSpinner, loadingSpinnerContainer)

import Html exposing (Attribute)
import Html.Attributes as A


mainContainer : Attribute msg
mainContainer =
    A.style
        [ ( "max-width", "50em" )
        , ( "margin", "0 auto" )
        , ( "padding", "1em" )
        ]


loadingSpinner : Attribute msg
loadingSpinner =
    A.style
        [ ( "border-radius", "50%" )
        , ( "width", "24px" )
        , ( "height", "24px" )
        , ( "border", "0.25rem solid #d9edf9" )
        , ( "border-top-color", "#add3e9" )
        , ( "animation", "spin 0.5s infinite" )
        ]


loadingSpinnerContainer : Attribute msg
loadingSpinnerContainer =
    A.style
        [ ( "display", "flex" )
        , ( "justify-content", "center" )
        ]
