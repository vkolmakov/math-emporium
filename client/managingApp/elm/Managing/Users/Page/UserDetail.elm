module Managing.Users.Page.UserDetail exposing (Model, Msg, init, initCmd, update, view)

import Html.Styled as H exposing (Attribute, Html)
import Http
import Managing.Request.RemoteData as RemoteData
import Managing.Users.Data.UserDetail exposing (UserDetail)
import Managing.Utils.DateUtils as DateUtils
import Managing.View.Loading exposing (spinner)
import Managing.View.Input as Input
import Managing.View.DataTable as DataTable


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
    let
        labelsWithElements =
            [ ( "ID", H.text (toString user.id) )
            , ( "Email", H.text user.email )
            , ( "Group", Input.text "Group" (toString user.group) False True )
            , ( "Phone", H.text (Maybe.withDefault "" user.phone) )
            , ( "Last Sign-in Date", H.text (DateUtils.toDisplayString user.lastSigninDate) )
            ]
    in
        labelsWithElements
            |> List.map (\( label, contentElement ) -> DataTable.field label contentElement)
            |> DataTable.item



{- DetailForm.container
   [ DetailForm.textField "ID" (toString user.id) False
   , DetailForm.textField "Email" user.email False
   , DetailForm.textField "Group" (toString user.group) False
   , DetailForm.textField "Phone" (toString user.phone) False
   , DetailForm.textField "Last Signin Date"  False
   ]
-}
-- HTTP


getUserDetail : Int -> Cmd Msg
getUserDetail id =
    let
        url =
            "/api/users/" ++ toString id
    in
        Http.send ReceiveUserDetail (Http.get url Managing.Users.Data.UserDetail.decode)
