module Managing.Main exposing (..)

import Html exposing (..)
import Navigation
import Managing.Routing as Routing


type Msg
    = RouteChange Navigation.Location
    | ChangeLocation String


type alias Model =
    { route : Routing.Route }


init : Navigation.Location -> ( { route : Routing.Route }, Cmd msg )
init location =
    let
        initialModel =
            { route = Routing.parseLocation location }
    in
        ( initialModel, Cmd.none )


navigation : Html Msg
navigation =
    let
        links =
            [ Routing.link (ChangeLocation "/manage-portal") "/manage-portal"
            , Routing.link (ChangeLocation "/manage-portal/users") "/manage-portal/users"
            ]
                |> List.map (\link -> div [] [ link ])
    in
        div [] links


content : Routing.Route -> Html msg
content route =
    case route of
        Routing.HomeRoute ->
            section [] [ text "home route" ]

        Routing.UsersRoute ->
            section [] [ text "users route" ]

        Routing.UnknownRoute ->
            section [] [ text "unknown route" ]


view : { a | route : Routing.Route } -> Html Msg
view model =
    main_ []
        [ navigation
        , content model.route
        ]


update :
    Msg
    -> { a | route : Routing.Route }
    -> ( { a | route : Routing.Route }, Cmd msg )
update msg model =
    case msg of
        ChangeLocation path ->
            ( model, Navigation.newUrl path )

        RouteChange location ->
            let
                nextRoute =
                    Routing.parseLocation location
            in
                ( { model | route = nextRoute }, Cmd.none )


main : Program Never { route : Routing.Route } Msg
main =
    Navigation.program RouteChange
        { init = init
        , view = view
        , update = update
        , subscriptions = \_ -> Sub.none
        }
