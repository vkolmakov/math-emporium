module Managing.View.SectionNav exposing (NavItem, view)

import Html.Styled as H exposing (Html)
import Html.Styled.Attributes as A
import Managing.Route as Route exposing (Route)
import Managing.Styles as Styles


type alias NavItem =
    { route : Route
    , label : String
    }


view : List NavItem -> Html msg
view navItems =
    let
        navItemToLink navItem =
            H.a
                [ Route.href navItem.route
                , Styles.sectionNavItemLink

                -- required to allow safely adjust font weight on hover/focus
                , A.attribute "data-text" navItem.label
                ]
                [ H.text navItem.label ]

        links =
            navItems
                |> List.map navItemToLink

        listItems =
            links
                |> List.map (\link -> H.li [ Styles.sectionNavItem ] [ link ])
    in
        H.ul [ Styles.sectionNavContainer ] listItems
