module Managing.Main exposing (main)

import Html.Styled as H exposing (Attribute, Html)
import Navigation
import Managing.Styles as Styles
import Managing.Route as Route exposing (Route)
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
    in
        ( Model route Users.init UserDetail.init
        , getInitCmd route
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
                    getInitCmd newRoute
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


getInitCmd route =
    case route of
        Route.Home ->
            Cmd.none

        Route.UserList ->
            Cmd.map UsersPageMsg Users.initCmd

        Route.UserDetail userId ->
            Cmd.map UserDetailPageMsg (UserDetail.initCmd userId)

        Route.Unknown ->
            Cmd.none



-- VIEW


view : Model -> Html Msg
view model =
    H.div [ Styles.mainContainer ]
        [ viewNavbar model
        , viewPageContent model
        ]


viewNavbar : Model -> Html Msg
viewNavbar model =
    let
        links =
            [ H.a [ Route.href Route.Home ] [ H.text "Home" ]
            , H.a [ Route.href Route.UserList ] [ H.text "Users" ]
            ]
    in
        H.ul [] (links |> List.map (\l -> H.li [] [ l ]))


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
