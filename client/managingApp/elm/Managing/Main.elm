module Managing.Main exposing (..)

import Html exposing (..)
import Navigation
import Managing.Routing as Routing
import Managing.Data.Routing exposing (..)


main : Program Never Model Msg
main =
    Navigation.program BrowserLocationChange
        { init = init
        , view = view
        , update = update
        , subscriptions = \_ -> Sub.none
        }



-- MODEL


type alias Model =
    { route : Route }


init : Navigation.Location -> ( Model, Cmd Msg )
init location =
    let
        initialModel =
            { route = Routing.parseLocation location }
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
                ( { model | route = nextRoute }, Cmd.none )

        ChangeRoute route ->
            let
                nextPath =
                    Routing.encodeRoute route
            in
                ( model, Navigation.newUrl nextPath )



-- VIEW


view : Model -> Html Msg
view model =
    main_ []
        [ navigation
        , content model.route
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


content : Route -> Html msg
content route =
    case route of
        HomeRoute ->
            section [] [ text "home route" ]

        UsersRoute ->
            section [] [ text "users route" ]

        UnknownRoute ->
            section [] [ text "unknown route" ]
