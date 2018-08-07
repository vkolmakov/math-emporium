module Managing.Page.UserDetail exposing (Model, Msg, init, initCmd, update, view)

import Html.Styled as H exposing (Attribute, Html)
import Http
import Date exposing (Date)
import Managing.Styles as Styles
import Managing.Request.RemoteData as RemoteData
import Managing.Data.User exposing (User)


-- MODEL


type alias Model =
    { userDetail : RemoteData.RemoteData User
    , id : Maybe Int
    }


init =
    Model RemoteData.Loading Nothing


initCmd =
    getUserDetail



-- UPDATE


type Msg
    = ReceiveUserDetail (Result Http.Error User)


update msg model =
    case msg of
        ReceiveUserDetail (Ok user) ->
            ( { model | id = Just user.id, userDetail = RemoteData.Available user }, Cmd.none )

        ReceiveUserDetail (Err e) ->
            ( { model | userDetail = RemoteData.Error (RemoteData.OtherError <| toString e) }, Cmd.none )



-- VIEW


view model =
    case model.userDetail of
        RemoteData.Loading ->
            loadingSpinner

        RemoteData.Available users ->
            H.div [] [ H.text <| "At user route: " ++ toString model.id ]

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


getUserDetail : Int -> Cmd Msg
getUserDetail id =
    let
        url =
            "/api/users/" ++ toString id
    in
        Http.send ReceiveUserDetail (Http.get url Managing.Data.User.decode)
