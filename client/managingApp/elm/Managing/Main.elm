module Managing.Main exposing (main)

import Html.Styled as H exposing (Attribute, Html)
import Navigation
import Managing.Styles as Styles
import Managing.Route as Route exposing (Route)
import Managing.View.SectionNav as SectionNav
import Managing.Users.Page.UserList as UserList
import Managing.Users.Page.UserDetail as UserDetail


main : Program Never Model Msg
main =
    Navigation.program BrowserLocationChange
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


init : Navigation.Location -> ( Model, Cmd Msg )
init location =
    let
        route =
            (Route.fromLocation location)

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
    = BrowserLocationChange Navigation.Location
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
update msg model =
    case msg of
        BrowserLocationChange newLocation ->
            let
                newRoute =
                    Route.fromLocation newLocation

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



-- VIEW


navItems : List SectionNav.NavItem
navItems =
    [ SectionNav.NavItem Route.Home "Home"
    , SectionNav.NavItem Route.UserList "Users"
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


view : Model -> Html Msg
view model =
    H.div [ Styles.mainContainer ]
        [ SectionNav.view navItems (getHighlightedRoute model.route)
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
    Sub.none
