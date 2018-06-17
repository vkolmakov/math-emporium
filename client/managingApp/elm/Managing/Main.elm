module Managing.Main exposing (..)

import Html exposing (..)
import Navigation
import Managing.Routes as Routes


type Msg
    = UrlChange Navigation.Location
    | ChangeLocation String


type alias Model =
    { route : Routes.Route }


init : Navigation.Location -> ( { route : Routes.Route }, Cmd msg )
init location =
    let
        initialModel =
            { route = Routes.parseLocation location }
    in
        ( initialModel, Cmd.none )


navigation : Html Msg
navigation =
    let
        links =
            [ Routes.link (ChangeLocation "/manage-portal") "/manage-portal"
            , Routes.link (ChangeLocation "/manage-portal/users") "/manage-portal/users"
            ]
                |> List.map (\link -> div [] [ link ])
    in
        div [] links


content : Routes.Route -> Html msg
content route =
    case route of
        Routes.HomeRoute ->
            section [] [ text "home route" ]

        Routes.UsersRoute ->
            section [] [ text "users route" ]

        Routes.UnknownRoute ->
            section [] [ text "unknown route" ]


view : { a | route : Routes.Route } -> Html Msg
view model =
    main_ []
        [ navigation
        , content model.route
        ]


update :
    Msg
    -> { a | route : Routes.Route }
    -> ( { a | route : Routes.Route }, Cmd msg )
update msg model =
    case msg of
        ChangeLocation path ->
            ( model, Navigation.newUrl path )

        UrlChange location ->
            let
                nextRoute =
                    Routes.parseLocation location
            in
                ( { model | route = nextRoute }, Cmd.none )


main : Program Never { route : Routes.Route } Msg
main =
    Navigation.program UrlChange
        { init = init
        , view = view
        , update = update
        , subscriptions = \_ -> Sub.none
        }
