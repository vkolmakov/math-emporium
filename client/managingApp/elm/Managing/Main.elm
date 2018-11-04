port module Managing.Main exposing (main)

import Browser
import Browser.Navigation as Navigation
import Html.Styled as H exposing (Attribute, Html)
import Html.Styled.Attributes as A
import Html.Styled.Events as E
import Json.Decode as Json
import Managing.Route as Route exposing (Route)
import Managing.Styles as Styles
import Managing.Users.Page.UserDetail as UserDetail
import Managing.Users.Page.UserList as UserList
import Url exposing (Url)


main =
    Browser.element
        { init = init
        , view = view >> H.toUnstyled
        , update = update
        , subscriptions = subscriptions
        }



-- MODEL


type alias Model =
    { route : Route
    , userListPageModel : UserList.Model
    , userDetailPageModel : UserDetail.Model
    }


init : String -> ( Model, Cmd Msg )
init locationHref =
    let
        route =
            Route.fromLocationHref locationHref

        initialModel =
            Model route UserList.init UserDetail.init

        ( initialModelBasedOnRoute, initialCmdBasedOnRoute ) =
            getInitModelCmd route initialModel
    in
    ( initialModelBasedOnRoute
    , initialCmdBasedOnRoute
      -- for initialization, passed route is the same as one on the model
    )



-- UPDATE


type Msg
    = LocationHrefChange String
    | RequestLocationHrefChange String
    | UserListPageMsg UserList.Msg
    | UserDetailPageMsg UserDetail.Msg


type OutMsg
    = UserDetailOutMsg (Maybe UserDetail.OutMsg)


handleOutMsg : Model -> OutMsg -> ( Model, Cmd msg )
handleOutMsg model outMsg =
    case outMsg of
        UserDetailOutMsg (Just msg) ->
            case msg of
                UserDetail.DoStuffToParent s ->
                    ( model, Cmd.none )

        UserDetailOutMsg Nothing ->
            ( model, Cmd.none )


update : Msg -> Model -> ( Model, Cmd Msg )
update message model =
    case message of
        RequestLocationHrefChange requestedLocationHref ->
            (model, pushLocationHrefChange requestedLocationHref)

        LocationHrefChange locationHref ->
            let
                newRoute =
                    Route.fromLocationHref locationHref

                ( updatedModelBasedOnRoute, initCmdBasedOnRoute ) =
                    getInitModelCmd newRoute model
            in
            ( { updatedModelBasedOnRoute | route = newRoute }, initCmdBasedOnRoute )

        UserListPageMsg msg ->
            let
                ( innerModel, innerCmd ) =
                    UserList.update msg model.userListPageModel
            in
            ( { model | userListPageModel = innerModel }, Cmd.map UserListPageMsg innerCmd )

        UserDetailPageMsg msg ->
            let
                ( innerModel, innerCmd, outMsg ) =
                    UserDetail.update msg model.userDetailPageModel

                ( updatedModelAfterOutMsg, cmdRequestedByOutMsg ) =
                    handleOutMsg model (UserDetailOutMsg outMsg)
            in
            ( { model | userDetailPageModel = innerModel }
            , Cmd.batch [ cmdRequestedByOutMsg, Cmd.map UserDetailPageMsg innerCmd ]
            )


{-| Returns a command for a NEW route with the PREVIOUS model.
This is useful for determining whether or not the data has to
be refreshed when navigating to a new route
-}
getInitModelCmd : Route -> Model -> ( Model, Cmd Msg )
getInitModelCmd route model =
    case route of
        Route.Home ->
            ( model, Cmd.none )

        Route.UserList ->
            ( model, Cmd.map UserListPageMsg (UserList.initCmd model.userListPageModel) )

        Route.UserDetail userId ->
            -- ensure that we start with a clear model because
            -- we want to avoid seeing old content if we end up
            -- navigating to that route more than once
            ( { model | userDetailPageModel = UserDetail.init }
            , Cmd.map UserDetailPageMsg (UserDetail.initCmd userId)
            )

        Route.Unknown ->
            ( model, Cmd.none )



-- TODO: maybe do Navigation.load "/"
-- VIEW


activeNavItems : List NavItem
activeNavItems =
    [ NavItem Route.Home "Home"
    , NavItem Route.UserList "Users"
    ]


getHighlightedRoute : Route -> Maybe Route
getHighlightedRoute route =
    case route of
        Route.UserList ->
            Just Route.UserList

        Route.UserDetail _ ->
            Just Route.UserList

        Route.Home ->
            Just Route.Home

        _ ->
            Nothing


view model =
    H.div [ Styles.mainContainer ]
        [ viewSectionNav activeNavItems (getHighlightedRoute model.route)
        , viewPageContent model
        ]


viewPageContent : Model -> Html Msg
viewPageContent model =
    let
        pageView =
            case model.route of
                Route.Home ->
                    H.text "At home route"

                Route.UserList ->
                    H.map UserListPageMsg <| UserList.view model.userListPageModel

                Route.UserDetail id ->
                    H.map UserDetailPageMsg <| UserDetail.view model.userDetailPageModel

                Route.Unknown ->
                    H.text "At unknown route"
    in
    H.div [] [ pageView ]



-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions model =
    onLocationHrefChange LocationHrefChange



-- NAVIGATION


port onLocationHrefChange : (String -> msg) -> Sub msg
port pushLocationHrefChange : String -> Cmd msg

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


navItemToLink : Maybe Route -> NavItem -> Html Msg
navItemToLink highlightedRoute navItem =
    let
        baseLinkAttributes =
            [ -- required to allow safely adjust font weight on hover/focus
              A.attribute "data-text" navItem.label
            ]

        linkStyles =
            getLinkStyles highlightedRoute navItem
    in
    Route.link
        (RequestLocationHrefChange (Route.toHref navItem.route))
        navItem.route
        (baseLinkAttributes ++ linkStyles)
        [ H.text navItem.label ]


viewSectionNav : List NavItem -> Maybe Route -> Html Msg
viewSectionNav navItems highlightedRoute =
    let
        links =
            navItems
                |> List.map (navItemToLink highlightedRoute)

        listItems =
            links
                |> List.map (\link -> H.li [ Styles.sectionNavItem ] [ link ])
    in
    H.ul [ Styles.sectionNavContainer ] listItems
