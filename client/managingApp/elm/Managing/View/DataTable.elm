module Managing.View.DataTable exposing
    ( actionContainer
    , actionLink
    , editLink
    , field
    , item
    , table
    , textField
    )

import Html.Styled as H exposing (Attribute, Html)
import Managing.Route as Route exposing (Route)
import Managing.Styles as Styles


table elements =
    H.div [] elements


item : List (Html msg) -> Html msg
item content =
    H.div [ Styles.dataTableItem ] content


field : String -> Html msg -> Html msg
field label contentElement =
    H.div [ Styles.dataTableField ]
        [ H.div [ Styles.dataTableFieldLabelWrapper ]
            -- note that the wrapper is required because
            -- we need to provide both padding and border
            -- for the field. Without the wrapper, the border
            -- that separates label from the content will be
            -- slightly smaller than the height of the container
            [ H.div [ Styles.dataTableFieldLabelContent ] [ H.text label ]
            ]
        , H.div [ Styles.dataTableFieldContentText ] [ contentElement ]
        ]


textField : String -> String -> Html msg
textField label text =
    field label (H.text text)


actionContainer : List (Html msg) -> Html msg
actionContainer actionElements =
    H.div [ Styles.dataTableEditLinkContainer ] actionElements


actionLink label onClickAttribute =
    H.button [ Styles.apply [ Styles.button.asLink ], onClickAttribute ] [ H.text label ]


editLink : msg -> Route -> Html msg
editLink msg route =
    Route.link msg route [ Styles.apply [ Styles.button.asLink ] ] [ H.text "Edit" ]
