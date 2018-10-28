module Managing.Main exposing (main)

import Html.Styled as H exposing (Attribute, Html)
import Navigation
import Managing.Styles as Styles
import Managing.Route as Route exposing (Route)
import Managing.View.SectionNav as SectionNav
import Managing.Users.Page.UserList as Users
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
    , usersPageModel : Users.Model
    , userDetailPageModel : UserDetail.Model
    }


init : Navigation.Location -> ( Model, Cmd Msg )
init location =
    let
        route =
            (Route.fromLocation location)

        initialModel =
            Model route Users.init UserDetail.init
    in
        ( initialModel
        , getInitCmd route initialModel
          -- for initialization, passed route is the same as one on the model
        )



-- UPDATE


type Msg
    = BrowserLocationChange Navigation.Location
    | UsersPageMsg Users.Msg
    | UserDetailPageMsg UserDetail.Msg


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        BrowserLocationChange newLocation ->
            let
                newRoute =
                    Route.fromLocation newLocation

                newCmd =
                    getInitCmd newRoute model
            in
                ( { model | route = newRoute }, newCmd )

        UsersPageMsg msg ->
            let
                ( innerModel, innerCmd ) =
                    Users.update msg model.usersPageModel
            in
                ( { model | usersPageModel = innerModel }, Cmd.map UsersPageMsg innerCmd )

        UserDetailPageMsg msg ->
            let
                ( innerModel, innerCmd ) =
                    UserDetail.update msg model.userDetailPageModel
            in
                ( { model | userDetailPageModel = innerModel }, Cmd.map UserDetailPageMsg innerCmd )


{-| Returns a command for a NEW route with the PREVIOUS model.
This is useful for determining whether or not the data has to
be refreshed when navigating to a new route
-}
getInitCmd route model =
    case route of
        Route.Home ->
            Cmd.none

        Route.UserList ->
            Cmd.map UsersPageMsg (Users.initCmd model.usersPageModel)

        Route.UserDetail userId ->
            Cmd.map UserDetailPageMsg (UserDetail.initCmd userId)

        Route.Unknown ->
            Cmd.none



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
                    H.map UsersPageMsg <| Users.view model.usersPageModel

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
