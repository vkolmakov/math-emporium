module Managing.View.DataTable exposing (table, item, textElement, editLinkElement)

import Html.Styled as H exposing (Attribute, Html)
import Html.Styled.Attributes as A
import Managing.Styles as Styles
import Managing.Route as Route exposing (Route)


table elements =
    H.div [] elements


item : List (Html msg) -> Html msg
item content =
    H.div [ Styles.dataTableRow ] content


textElement : String -> String -> Html msg
textElement label text =
    H.div [ Styles.dataTableCellText, A.attribute "data-label" label ] [ H.text text ]


editLinkElement : Route -> Html msg
editLinkElement route =
    H.div [ Styles.dataTableCellEditLink ]
        [ H.a [ Route.href route ] [ H.text "Edit" ]
        ]
