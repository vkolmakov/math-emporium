module Managing.Main exposing (..)

import Html as H exposing (Html, Attribute)
import Html.Events as E
import Html.Attributes as A
import Managing.Styles as Styles
import Navigation
import UrlParser exposing (s, (</>))
import Json.Decode as Decode


main : Program Never Model Msg
main =
    Navigation.program BrowserLocationChange
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }



-- MODEL


type alias Model =
    { route : Route
    }


init : Navigation.Location -> ( Model, Cmd Msg )
init location =
    ( Model (locationToRoute location)
    , Cmd.none
    )



-- UPDATE


type Msg
    = BrowserLocationChange Navigation.Location
    | ChangeRoute Route


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        BrowserLocationChange newLocation ->
            let
                newRoute =
                    locationToRoute newLocation
            in
                ( { model | route = newRoute }, Cmd.none )

        ChangeRoute newRoute ->
            ( model, Navigation.newUrl <| routeToPath newRoute )



-- VIEW


view : Model -> Html Msg
view model =
    H.div [ Styles.mainContainerStyle ]
        [ viewNavigation model
        , viewPageContent model
        ]


viewNavigation : Model -> Html Msg
viewNavigation model =
    let
        links =
            [ linkTo HomeRoute (ChangeRoute HomeRoute) [] [ H.text "To home" ]
            , linkTo UsersRoute (ChangeRoute UsersRoute) [] [ H.text "To users" ]
            ]
    in
        H.ul [] (links |> List.map (\l -> H.li [] [ l ]))


viewPageContent : Model -> Html msg
viewPageContent model =
    let
        pageView =
            case model.route of
                HomeRoute ->
                    H.text "At home route"

                UsersRoute ->
                    H.text "At users route"

                UnknownRoute ->
                    H.text "At unknown route"
    in
        H.div [] [ pageView ]


linkTo : Route -> msg -> List (Attribute msg) -> List (Html msg) -> Html msg
linkTo to msg attrs =
    let
        changeLocationOnClick =
            E.onWithOptions "click" { stopPropagation = False, preventDefault = True } (Decode.succeed msg)
    in
        H.a ([ changeLocationOnClick, A.href <| routeToPath to ] ++ attrs)



-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.none



-- ROUTING


type Route
    = HomeRoute
    | UsersRoute
    | UnknownRoute


routeToPath : Route -> String
routeToPath r =
    case r of
        HomeRoute ->
            "/manage-portal"

        UsersRoute ->
            "/manage-portal/users"

        UnknownRoute ->
            "/manage-portal"


locationToRoute : Navigation.Location -> Route
locationToRoute location =
    let
        matchers =
            UrlParser.oneOf
                [ UrlParser.map HomeRoute (s "manage-portal")
                , UrlParser.map UsersRoute (s "manage-portal" </> s "users")
                ]
    in
        case (UrlParser.parsePath matchers location) of
            Just route ->
                route

            Nothing ->
                UnknownRoute



-- HTTP
