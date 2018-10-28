module Managing.Users.Page.UserDetail exposing (Model, Msg, init, initCmd, update, view)

import Html.Styled as H exposing (Attribute, Html)
import Html.Styled.Attributes as A
import Http
import Managing.Styles as Styles
import Managing.Request.RemoteData as RemoteData
import Managing.Users.Data.UserDetail exposing (UserDetail)
import Managing.Utils.DateUtils as DateUtils
import Managing.View.Loading exposing (spinner)


-- MODEL


type alias Model =
    { userDetail : RemoteData.RemoteData UserDetail
    , id : Maybe Int
    }


init =
    Model RemoteData.Loading Nothing


initCmd userId =
    getUserDetail userId



-- UPDATE


type Msg
    = ReceiveUserDetail (Result Http.Error UserDetail)


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
            spinner

        RemoteData.Available user ->
            H.div [] [ displayUserDetail user ]

        RemoteData.Error e ->
            H.div [] [ H.text <| "An error ocurred: " ++ (toString e) ]


displayUserDetail user =
    H.div []
        [ textField "ID" (toString user.id) False
        , textField "Email" user.email False
        , textField "Group" (toString user.group) False
        , textField "Phone" (toString user.phone) False
        , textField "Last Signin Date" (DateUtils.toDisplayString user.lastSigninDate) False
        ]



-- VIEW GENERIC


textField : String -> String -> Bool -> Html msg
textField label value isEditable =
    let
        fieldLabel =
            H.label [ Styles.fieldLabel ] [ H.text label ]

        fieldInput =
            H.input [ Styles.fieldTextInput, A.disabled <| not isEditable, A.value value ] []
    in
        H.div
            [ Styles.fieldGroup ]
            [ fieldLabel
            , fieldInput
            ]



-- HTTP


getUserDetail : Int -> Cmd Msg
getUserDetail id =
    let
        url =
            "/api/users/" ++ toString id
    in
        Http.send ReceiveUserDetail (Http.get url Managing.Users.Data.UserDetail.decode)
