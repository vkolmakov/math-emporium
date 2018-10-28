module Managing.View.SectionNav exposing (NavItem, view)

import Html.Styled as H exposing (Html, Attribute)
import Html.Styled.Attributes as A
import Managing.Route as Route exposing (Route)
import Managing.Styles as Styles


type alias NavItem =
    { route : Route
    , label : String
    }


getLinkStyles : Maybe Route -> NavItem -> List (Attribute msg)
getLinkStyles highlightedRoute navItem =
    case highlightedRoute of
        Just r ->
            if r == navItem.route then
                [ Styles.sectionNavItemLink, Styles.sectionNavItemLinkHighlighted ]
            else
                [ Styles.sectionNavItemLink ]

        Nothing ->
            [ Styles.sectionNavItemLink ]


navItemToLink : Maybe Route -> NavItem -> Html msg
navItemToLink highlightedRoute navItem =
    let
        baseLinkAttributes =
            [ Route.href navItem.route

            -- required to allow safely adjust font weight on hover/focus
            , A.attribute "data-text" navItem.label
            ]

        linkStyles =
            getLinkStyles highlightedRoute navItem
    in
        H.a
            (baseLinkAttributes ++ linkStyles)
            [ H.text navItem.label ]


view : List NavItem -> Maybe Route -> Html msg
view navItems highlightedRoute =
    let
        links =
            navItems
                |> List.map (navItemToLink highlightedRoute)

        listItems =
            links
                |> List.map (\link -> H.li [ Styles.sectionNavItem ] [ link ])
    in
        H.ul [ Styles.sectionNavContainer ] listItems
