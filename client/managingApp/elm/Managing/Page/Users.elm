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
import Managing.View.DataTable as DataTable


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
        viewUserRow user =
            let
                labelsWithData =
                    [ ( "Email", user.email )
                    , ( "Group", toString user.group )
                    , ( "Phone", Maybe.withDefault "" user.phone )
                    , ( "Last sign-in date", dateToDisplayString user.lastSigninDate )
                    ]

                fields =
                    labelsWithData
                        |> List.map (\( label, entry ) -> DataTable.textElement label entry)

                actions =
                    [ DataTable.editLinkElement (Route.UserDetail user.id) ]
            in
                DataTable.item (actions ++ fields)
    in
        case model.users of
            RemoteData.Loading ->
                loadingSpinner

            RemoteData.Available users ->
                DataTable.table (users |> List.map viewUserRow)

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



-- HTTP


getUsers : Cmd Msg
getUsers =
    let
        url =
            "/api/users"
    in
        Http.send ReceiveUsers (Http.get url (Managing.Data.User.decode |> Decode.list))
