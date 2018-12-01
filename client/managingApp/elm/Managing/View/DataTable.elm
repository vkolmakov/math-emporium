module Managing.View.DataTable exposing
    ( SourceCode
    , actionContainer
    , actionLink
    , editLink
    , field
    , item
    , sourceCodeField
    , sourceCodeFromString
    , table
    , textField
    )

import Html as H exposing (Attribute, Html)
import Managing.Route as Route exposing (Route)
import Managing.Styles as Styles


type SourceCode
    = SourceCode String


sourceCodeFromString : String -> SourceCode
sourceCodeFromString s =
    SourceCode s


table elements =
    H.div [ Styles.apply [ Styles.dataList.self ] ] elements


item : List (Html msg) -> Html msg
item content =
    H.div [ Styles.apply [ Styles.dataList.item ] ] content


field : String -> Html msg -> Html msg
field label contentElement =
    H.div [ Styles.apply [ Styles.dataList.itemField ] ]
        [ H.div [ Styles.apply [ Styles.dataList.itemFieldLabel ] ]
            -- note that the wrapper is required because
            -- we need to provide both padding and border
            -- for the field. Without the wrapper, the border
            -- that separates label from the content will be
            -- slightly smaller than the height of the container
            [ H.div [ Styles.apply [ Styles.utility.boldText ] ] [ H.text label ]
            ]
        , H.div [ Styles.apply [ Styles.dataList.itemFieldValue ] ] [ contentElement ]
        ]


textField : String -> String -> Html msg
textField label text =
    field label (H.text text)


sourceCodeField : String -> SourceCode -> Html msg
sourceCodeField label (SourceCode s) =
    field label (H.pre [] [ H.text s ])


actionContainer : List (Html msg) -> Html msg
actionContainer actionElements =
    H.div
        [ Styles.apply [ Styles.dataList.itemActions ]
        ]
        actionElements


actionLink label onClickAttribute =
    H.button [ Styles.apply [ Styles.button.asLink ], onClickAttribute ] [ H.text label ]


editLink : msg -> Route -> Html msg
editLink msg route =
    Route.link msg route [ Styles.apply [ Styles.button.asLink ] ] [ H.text "Edit" ]
