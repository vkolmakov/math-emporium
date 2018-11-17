port module Managing.Main exposing (main)

import Browser
import Browser.Navigation as Navigation
import Html.Styled as H exposing (Attribute, Html)
import Html.Styled.Attributes as A
import Html.Styled.Events as E
import Html.Styled.Lazy exposing (lazy, lazy2)
import Json.Decode as Json
import Managing.Events.Page.EventList as EventList
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
    , eventListPageModel : EventList.Model
    }


init : String -> ( Model, Cmd Msg )
init locationHref =
    let
        route =
            Route.fromLocationHref locationHref

        initialModel =
            Model route UserList.init UserDetail.init EventList.init

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
    | EventListPageMsg EventList.Msg


type OutMsg
    = UserDetailOutMsg (Maybe UserDetail.OutMsg)
    | UserListPageOutMsg (Maybe UserList.OutMsg)


handleOutMsg : Model -> OutMsg -> ( Model, Cmd msg )
handleOutMsg model outMsg =
    case outMsg of
        UserDetailOutMsg (Just msg) ->
            case msg of
                UserDetail.DoStuffToParent s ->
                    ( model, Cmd.none )

        UserDetailOutMsg Nothing ->
            ( model, Cmd.none )

        UserListPageOutMsg (Just msg) ->
            case msg of
                UserList.RequestNavigationTo requestedRoute ->
                    ( model, pushLocationHrefChange (Route.toHref requestedRoute) )

        UserListPageOutMsg Nothing ->
            ( model, Cmd.none )


update : Msg -> Model -> ( Model, Cmd Msg )
update message model =
    case message of
        RequestLocationHrefChange requestedLocationHref ->
            ( model, pushLocationHrefChange requestedLocationHref )

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
                ( innerModel, innerCmd, outMsg ) =
                    UserList.update msg model.userListPageModel

                ( updatedModelAfterOutMsg, cmdRequestedByOutMsg ) =
                    handleOutMsg model (UserListPageOutMsg outMsg)
            in
            ( { updatedModelAfterOutMsg | userListPageModel = innerModel }
            , Cmd.batch [ cmdRequestedByOutMsg, Cmd.map UserListPageMsg innerCmd ]
            )

        UserDetailPageMsg msg ->
            let
                ( innerModel, innerCmd, outMsg ) =
                    UserDetail.update msg model.userDetailPageModel

                ( updatedModelAfterOutMsg, cmdRequestedByOutMsg ) =
                    handleOutMsg model (UserDetailOutMsg outMsg)
            in
            ( { updatedModelAfterOutMsg | userDetailPageModel = innerModel }
            , Cmd.batch [ cmdRequestedByOutMsg, Cmd.map UserDetailPageMsg innerCmd ]
            )

        EventListPageMsg msg ->
            let
                ( innerModel, innerCmd, outMsg ) =
                    EventList.update msg model.eventListPageModel

                ( updatedModelAfterOutMsg, cmdRequestedByOutMsg ) =
                    handleOutMsg model (UserDetailOutMsg outMsg)
            in
            ( { updatedModelAfterOutMsg | eventListPageModel = innerModel }
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
            {- ensure that we start with a clear model because
               we want to avoid seeing old content if we end up
               navigating to that route more than once
            -}
            ( { model | userDetailPageModel = UserDetail.init }
            , Cmd.map UserDetailPageMsg (UserDetail.initCmd userId)
            )

        Route.EventList ->
            ( model, Cmd.map EventListPageMsg (EventList.initCmd model.eventListPageModel) )

        Route.Unknown ->
            ( model, Cmd.none )



-- TODO: maybe do Navigation.load "/"
-- VIEW


activeNavItems : List NavItem
activeNavItems =
    [ NavItem Route.UserList "Users"
    , NavItem Route.EventList "Events"
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

        Route.EventList ->
            Just Route.EventList

        _ ->
            Nothing


view model =
    H.div [ Styles.mainContainer ]
        [ lazy2 viewSectionNav activeNavItems (getHighlightedRoute model.route)
        , lazy viewPageContent model
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

                Route.EventList ->
                    H.map EventListPageMsg <| EventList.view model.eventListPageModel

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
