module Managing.Main exposing (..)

import Html as H exposing (Html, Attribute)
import Html.Events as E
import Html.Attributes as A
import Http
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
    , users : RemoteData (List User)
    }


type RemoteDataError
    = UnathorizedRequest
    | OtherError String


type RemoteData a
    = Loading
    | Error RemoteDataError
    | Available a


type AccessGroup
    = UserGroup
    | EmployeeGroup
    | EmployerGroup
    | AdminGroup


type alias User =
    { email : String
    , group : AccessGroup
    }


init : Navigation.Location -> ( Model, Cmd Msg )
init location =
    let
        route =
            (locationToRoute location)
    in
        ( Model route Loading
        , getInitCmd route
        )



-- UPDATE


type Msg
    = BrowserLocationChange Navigation.Location
    | ChangeRoute Route
    | ReceiveUsers (Result Http.Error (List User))


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        BrowserLocationChange newLocation ->
            let
                newRoute =
                    locationToRoute newLocation

                newCmd =
                    getInitCmd newRoute
            in
                ( { model | route = newRoute }, newCmd )

        ChangeRoute newRoute ->
            ( model, Navigation.newUrl <| routeToPath newRoute )

        ReceiveUsers (Ok users) ->
            ( { model | users = Available users }, Cmd.none )

        ReceiveUsers (Err e) ->
            ( { model | users = Error (OtherError <| toString e) }, Cmd.none )


getInitCmd route =
    case route of
        UsersRoute ->
            getUsers

        _ ->
            Cmd.none



-- VIEW


view : Model -> Html Msg
view model =
    H.div [ Styles.mainContainer ]
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


loadingSpinner : Html msg
loadingSpinner =
    H.div [ Styles.loadingSpinnerContainer ]
        [ H.div [ Styles.loadingSpinner ] []
        ]


viewPageContent : Model -> Html msg
viewPageContent model =
    let
        pageView =
            case model.route of
                HomeRoute ->
                    H.text "At home route"

                UsersRoute ->
                    viewUsersPage model

                UnknownRoute ->
                    H.text "At unknown route"
    in
        H.div [] [ pageView ]


viewUsersPage : Model -> Html msg
viewUsersPage model =
    let
        viewUserRow user =
            H.div [] [ H.text <| user.email ++ " " ++ toString user.group ]
    in
        case model.users of
            Loading ->
                loadingSpinner

            Available users ->
                H.div [] (users |> List.map viewUserRow)

            Error e ->
                H.div [] [ H.text <| "An error ocurred: " ++ (toString e) ]


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


getUsers : Cmd Msg
getUsers =
    let
        decodeGroup groupId =
            case groupId of
                1 ->
                    Decode.succeed UserGroup

                2 ->
                    Decode.succeed EmployeeGroup

                3 ->
                    Decode.succeed EmployerGroup

                4 ->
                    Decode.succeed AdminGroup

                _ ->
                    Decode.fail "Unknown access group ID"

        decodeUser =
            Decode.map2 User
                (Decode.at [ "email" ] Decode.string)
                (Decode.at [ "group" ] Decode.int |> Decode.andThen decodeGroup)

        url =
            "/api/users"
    in
        Http.send ReceiveUsers (Http.get url (decodeUser |> Decode.list))
