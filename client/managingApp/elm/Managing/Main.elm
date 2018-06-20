module Managing.Main exposing (..)

import Html exposing (..)
import Navigation
import Managing.Routing as Routing
import Managing.Data.Routing exposing (..)
import Managing.Page.Users as Users


main : Program Never Model Msg
main =
    Navigation.program BrowserLocationChange
        { init = init
        , view = view
        , update = update
        , subscriptions = \_ -> Sub.none
        }



-- MODEL


type PageState
    = UsersState Users.Model
    | Blank


type alias Model =
    { route : Route
    , pageState : PageState
    }


init : Navigation.Location -> ( Model, Cmd Msg )
init location =
    let
        initialModel =
            { route = Routing.parseLocation location
            , pageState = Blank
            }
    in
        ( initialModel, Cmd.none )



-- UPDATE


type Msg
    = BrowserLocationChange Navigation.Location
    | ChangeRoute Route


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        BrowserLocationChange location ->
            let
                nextRoute =
                    Routing.parseLocation location
            in
                ( { route = nextRoute
                  , pageState = getPageState nextRoute
                  }
                , getPageCmd nextRoute
                )

        ChangeRoute route ->
            let
                nextPath =
                    Routing.encodeRoute route
            in
                ( model, Navigation.newUrl nextPath )


getPageState route =
    case route of
        UsersRoute ->
            UsersState Users.init

        _ ->
            Blank


getPageCmd route =
    case route of
        UsersRoute ->
            Cmd.none

        _ ->
            Cmd.none



-- VIEW


view : Model -> Html Msg
view model =
    main_ []
        [ navigation
        , content model
        ]


navigation : Html Msg
navigation =
    let
        links =
            [ Routing.link HomeRoute (ChangeRoute HomeRoute) [] [ text "Home" ]
            , Routing.link UsersRoute (ChangeRoute UsersRoute) [] [ text "Users" ]
            ]
                |> List.map (\link -> div [] [ link ])
    in
        div [] links


error =
    div []


content : Model -> Html msg
content model =
    case ( model.route, model.pageState ) of
        ( HomeRoute, _ ) ->
            section [] [ text "home route" ]

        ( UsersRoute, UsersState s ) ->
            Users.view s

        _ ->
            section [] [ text "unknown route" ]
