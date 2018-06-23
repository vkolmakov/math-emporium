module Managing.Styles exposing (mainContainerStyle)

import Html.Attributes as A


mainContainerStyle =
    A.style
        [ ( "max-width", "50em" )
        , ( "margin", "0 auto" )
        , ( "padding", "1em" )
        ]
