module Managing.View.DataTable
    exposing
        ( table
        , item
        , textField
        , editLink
        , actionContainer
        , action
        )

import Html.Styled as H exposing (Attribute, Html)
import Managing.Styles as Styles
import Managing.Route as Route exposing (Route)


table elements =
    H.div [] elements


item : List (Html msg) -> Html msg
item content =
    H.div [ Styles.dataTableItem ] content


textField : String -> String -> Html msg
textField label text =
    H.div [ Styles.dataTableField ]
        [ H.div [ Styles.dataTableFieldLabelWrapper ]
            -- note that the wrapper is required because
            -- we need to provide both padding and border
            -- for the field. Without the wrapper, the border
            -- that separates label from the content will be
            -- slightly smaller than the height of the container
            [ H.div [ Styles.dataTableFieldLabelContent ] [ H.text label ]
            ]
        , H.div [ Styles.dataTableFieldContentText ] [ H.text text ]
        ]


actionContainer : List (Html msg) -> Html msg
actionContainer actionElements =
    H.div [ Styles.dataTableEditLinkContainer ] actionElements


action label onClickAttribute =
    H.button [ Styles.dataTableAction, onClickAttribute ] [ H.text label ]


editLink : Route -> Html msg
editLink route =
    H.a [ Styles.dataTableAction, Route.href route ] [ H.text "Edit" ]
