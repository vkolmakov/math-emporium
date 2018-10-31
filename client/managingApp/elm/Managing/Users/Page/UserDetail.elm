module Managing.Users.Page.UserDetail exposing (Model, Msg, OutMsg(..), init, initCmd, update, view)

import Html.Styled as H exposing (Attribute, Html)
import Html.Styled.Events as E
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
    | TriggerMessageToParent String


type OutMsg
    = DoStuffToParent String


update : Msg -> Model -> ( Model, Cmd msg, Maybe OutMsg )
update msg model =
    case msg of
        ReceiveUserDetail (Ok user) ->
            ( { model | id = Just user.id, userDetail = RemoteData.Available user }, Cmd.none, Nothing )

        ReceiveUserDetail (Err e) ->
            ( { model | userDetail = RemoteData.Error (RemoteData.OtherError <| toString e) }, Cmd.none, Nothing )

        TriggerMessageToParent s ->
            ( model, Cmd.none, Just (DoStuffToParent s) )



-- VIEW


view model =
    case model.userDetail of
        RemoteData.Loading ->
            spinner

        RemoteData.Available user ->
            -- TODO: add a save button somewhere here
            H.div [] [ displayUserDetail user ]

        RemoteData.Error e ->
            H.div [] [ H.text <| "An error ocurred: " ++ (toString e) ]


displayUserDetail user =
    let
        labelsWithElements =
            [ ( "ID", H.text (toString user.id) )
            , ( "Email", H.text user.email )
            , ( "Group"
              , Input.text
                    -- TODO: use a select input instead
                    { label = "Group"
                    , value = (toString user.group)
                    , isEditable = True
                    , isLabelHidden = True
                    }
                    (E.onInput TriggerMessageToParent)
              )
            , ( "Phone", H.text (Maybe.withDefault "" user.phone) )
            , ( "Last Sign-in Date", H.text (DateUtils.toDisplayString user.lastSigninDate) )
            ]
    in
        labelsWithElements
            |> List.map (\( label, contentElement ) -> DataTable.field label contentElement)
            |> DataTable.item



-- HTTP


getUserDetail : Int -> Cmd Msg
getUserDetail id =
    let
        url =
            "/api/users/" ++ toString id
    in
        Http.send ReceiveUserDetail (Http.get url Managing.Users.Data.UserDetail.decode)
