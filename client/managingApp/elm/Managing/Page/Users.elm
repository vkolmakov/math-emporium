module Managing.Page.Users exposing (Model, Msg, init, initCmd, update, view)

import Html.Styled as H exposing (Attribute, Html)
import Html.Styled.Attributes as A
import Http
import Json.Decode as Decode
import Date exposing (Date)
import Managing.Styles as Styles
import Managing.Route as Route exposing (Route)
import Managing.Request.RemoteData as RemoteData
import Managing.Data.User exposing (User)


-- MODEL


type alias Model =
    { users : RemoteData.RemoteData (List User)
    }


init =
    Model RemoteData.Loading


initCmd =
    getUsers



-- UPDATE


type Msg
    = ReceiveUsers (Result Http.Error (List User))


update msg model =
    case msg of
        ReceiveUsers (Ok users) ->
            ( { model | users = RemoteData.Available users }, Cmd.none )

        ReceiveUsers (Err e) ->
            ( { model | users = RemoteData.Error (RemoteData.OtherError <| toString e) }, Cmd.none )



-- VIEW


view model =
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
            [ dataTableCellEdit (Route.UserDetail user.id) ]

        viewUserRow user =
            dataTableRow (actionRows user ++ dataRows user)
    in
        case model.users of
            RemoteData.Loading ->
                loadingSpinner

            RemoteData.Available users ->
                H.div [] (users |> List.map viewUserRow)

            RemoteData.Error e ->
                H.div [] [ H.text <| "An error ocurred: " ++ (toString e) ]



-- VIEW GENERIC


loadingSpinner : Html msg
loadingSpinner =
    H.div [ Styles.loadingSpinnerContainer ]
        [ H.div [ Styles.loadingSpinner ] []
        ]


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
            , symbol " "
            , toString << Date.year
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


dataTableCellEdit : Route -> Html msg
dataTableCellEdit route =
    H.div [ Styles.dataTableCellEditLink ]
        [ H.a [ Route.href route ] [ H.text "Edit" ]
        ]



-- HTTP


getUsers : Cmd Msg
getUsers =
    let
        url =
            "/api/users"
    in
        Http.send ReceiveUsers (Http.get url (Managing.Data.User.decode |> Decode.list))
