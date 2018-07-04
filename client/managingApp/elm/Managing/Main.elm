module Managing.Main exposing (..)

import Html.Styled as H exposing (Attribute, Html)
import Html.Styled.Events as E
import Html.Styled.Attributes as A
import Http
import Managing.Styles as Styles
import Navigation
import UrlParser exposing (s, (</>))
import Json.Decode as Decode
import Date exposing (Date)


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
    { id : Int
    , email : String
    , group : AccessGroup
    , phone : Maybe String
    , lastSigninDate : Date
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


getInitCmd : Route -> Cmd Msg
getInitCmd route =
    case route of
        UsersRoute ->
            getUsers

        UserDetailRoute id ->
            getUserDetail id

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
            [ linkTo HomeRoute (ChangeRoute HomeRoute) [] [ H.text "Home" ]
            , linkTo UsersRoute (ChangeRoute UsersRoute) [] [ H.text "Users" ]
            ]
    in
        H.ul [] (links |> List.map (\l -> H.li [] [ l ]))


loadingSpinner : Html msg
loadingSpinner =
    H.div [ Styles.loadingSpinnerContainer ]
        [ H.div [ Styles.loadingSpinner ] []
        ]


viewPageContent : Model -> Html Msg
viewPageContent model =
    let
        pageView =
            case model.route of
                HomeRoute ->
                    H.text "At home route"

                UsersRoute ->
                    viewUsersPage model.users

                UserDetailRoute id ->
                    viewUserDetailPage { id = id }

                UnknownRoute ->
                    H.text "At unknown route"
    in
        H.div [] [ pageView ]


dateToDisplayString : Date -> String
dateToDisplayString date =
    let
        symbol s =
            \_ -> s

        toks =
            [ toString << Date.dayOfWeek
            , symbol ", "
            , toString << Date.month
            , symbol " "
            , toString << Date.day
            , symbol ", "
            , toString << Date.hour
            , symbol ":"
            , String.padLeft 2 '0' << toString << Date.minute
            ]
    in
        List.map (\tok -> tok date) toks
            |> String.join ""


dataTableRow : List (Html msg) -> Html msg
dataTableRow content =
    H.div [ Styles.dataTableRow ] content


dataTableCellText : String -> String -> Html msg
dataTableCellText label text =
    H.div [ Styles.dataTableCellText, A.attribute "data-label" label ] [ H.text text ]


dataTableCellEdit : Route -> msg -> Html msg
dataTableCellEdit route msg =
    H.div [ Styles.dataTableCellEditLink ]
        [ linkTo route msg [] [ H.text "Edit" ]
        ]



-- USERS


viewUsersPage : RemoteData (List User) -> Html Msg
viewUsersPage users =
    let
        getData user =
            [ user.email
            , toString user.group
            , Maybe.withDefault "" user.phone
            , dateToDisplayString user.lastSigninDate
            ]

        headers =
            [ "Email"
            , "Group"
            , "Phone"
            , "Last sign-in date"
            ]

        dataRows user =
            List.map2 (,) headers (getData user)
                |> List.map (\( label, entry ) -> dataTableCellText label entry)

        actionRows user =
            [ dataTableCellEdit (UserDetailRoute user.id) (ChangeRoute <| UserDetailRoute user.id) ]

        viewUserRow user =
            dataTableRow (actionRows user ++ dataRows user)
    in
        case users of
            Loading ->
                loadingSpinner

            Available users ->
                H.div [] (users |> List.map viewUserRow)

            Error e ->
                H.div [] [ H.text <| "An error ocurred: " ++ (toString e) ]



-- USER DETAIL


viewUserDetailPage user =
    H.div [] [ H.text <| "On user page: " ++ toString user.id ]



-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.none



-- ROUTING


type Route
    = HomeRoute
    | UsersRoute
    | UserDetailRoute Int
    | UnknownRoute


routeToPath : Route -> String
routeToPath r =
    case r of
        HomeRoute ->
            "/manage-portal"

        UsersRoute ->
            "/manage-portal/users"

        UserDetailRoute id ->
            "/manage-portal/users/" ++ toString id

        UnknownRoute ->
            "/manage-portal"


locationToRoute : Navigation.Location -> Route
locationToRoute location =
    let
        matchers =
            UrlParser.oneOf
                [ UrlParser.map HomeRoute (s "manage-portal")
                , UrlParser.map UsersRoute (s "manage-portal" </> s "users")
                , UrlParser.map UserDetailRoute (s "manage-portal" </> s "users" </> UrlParser.int)
                ]
    in
        case (UrlParser.parsePath matchers location) of
            Just route ->
                route

            Nothing ->
                UnknownRoute


linkTo : Route -> msg -> List (Attribute msg) -> List (Html msg) -> Html msg
linkTo to msg attrs =
    let
        changeLocationOnClick =
            E.onWithOptions "click" { stopPropagation = False, preventDefault = True } (Decode.succeed msg)
    in
        H.a ([ changeLocationOnClick, A.href <| routeToPath to ] ++ attrs)



-- HTTP


decodeDate : String -> Decode.Decoder Date
decodeDate date =
    case Date.fromString date of
        Ok d ->
            Decode.succeed d

        Err e ->
            Decode.fail e


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
            Decode.map5 User
                (Decode.at [ "id" ] Decode.int)
                (Decode.at [ "email" ] Decode.string)
                (Decode.at [ "group" ] Decode.int |> Decode.andThen decodeGroup)
                (Decode.at [ "phoneNumber" ] <| Decode.nullable Decode.string)
                (Decode.at [ "lastSigninAt" ] Decode.string |> Decode.andThen decodeDate)

        url =
            "/api/users"
    in
        Http.send ReceiveUsers (Http.get url (decodeUser |> Decode.list))


getUserDetail : Int -> Cmd msg
getUserDetail id =
    Cmd.none
