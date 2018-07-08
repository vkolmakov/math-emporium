module Managing.Main exposing (..)

import Html.Styled as H exposing (Attribute, Html)
import Html.Styled.Events as E
import Html.Styled.Attributes as A
import Http
import Navigation
import Json.Decode as Decode
import Date exposing (Date)
import Managing.Styles as Styles
import Managing.Data.User exposing (User)
import Managing.Route as Route exposing (Route)


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
    , userDetail : RemoteData User
    }


type RemoteDataError
    = UnathorizedRequest
    | OtherError String


type RemoteData a
    = Loading
    | Error RemoteDataError
    | Available a


init : Navigation.Location -> ( Model, Cmd Msg )
init location =
    let
        route =
            (Route.fromLocation location)
    in
        ( Model route Loading Loading
        , getInitCmd route
        )



-- UPDATE


type Msg
    = BrowserLocationChange Navigation.Location
    | ChangeRoute Route
    | ReceiveUsers (Result Http.Error (List User))
    | ReceiveUserDetail (Result Http.Error User)


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

        ChangeRoute newRoute ->
            ( model, Navigation.newUrl <| Route.toHref newRoute )

        ReceiveUsers (Ok users) ->
            ( { model | users = Available users }, Cmd.none )

        ReceiveUsers (Err e) ->
            ( { model | users = Error (OtherError <| toString e) }, Cmd.none )

        ReceiveUserDetail (Ok user) ->
            ( { model | userDetail = Available user }, Cmd.none )

        ReceiveUserDetail (Err e) ->
            ( { model | userDetail = Error (OtherError <| toString e) }, Cmd.none )


getInitCmd : Route -> Cmd Msg
getInitCmd route =
    case route of
        Route.Users ->
            getUsers

        Route.UserDetail id ->
            getUserDetail id

        _ ->
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
            [ linkTo Route.Home (ChangeRoute Route.Home) [] [ H.text "Home" ]
            , linkTo Route.Users (ChangeRoute Route.Users) [] [ H.text "Users" ]
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
                Route.Home ->
                    H.text "At home route"

                Route.Users ->
                    viewUsersPage model.users

                Route.UserDetail id ->
                    viewUserDetailPage { id = id }

                Route.Unknown ->
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
            [ dataTableCellEdit (Route.UserDetail user.id) (ChangeRoute <| Route.UserDetail user.id) ]

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


viewUserDetailPage : { b | id : a } -> Html msg
viewUserDetailPage user =
    H.div [] [ H.text <| "On user page: " ++ toString user.id ]



-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.none



-- ROUTING


linkTo : Route -> msg -> List (Attribute msg) -> List (Html msg) -> Html msg
linkTo to msg attrs =
    let
        changeLocationOnClick =
            E.onWithOptions "click" { stopPropagation = False, preventDefault = True } (Decode.succeed msg)
    in
        H.a ([ changeLocationOnClick, A.href <| Route.toHref to ] ++ attrs)



-- HTTP


getUsers : Cmd Msg
getUsers =
    let
        url =
            "/api/users"
    in
        Http.send ReceiveUsers (Http.get url (Managing.Data.User.decode |> Decode.list))


getUserDetail : Int -> Cmd Msg
getUserDetail id =
    let
        url =
            "/api/users/" ++ toString id
    in
        Http.send ReceiveUserDetail (Http.get url Managing.Data.User.decode)
