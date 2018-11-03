module Managing.Users.Page.UserDetail exposing (Model, Msg, OutMsg(..), init, initCmd, update, view)

import Html.Styled as H exposing (Attribute, Html)
import Html.Styled.Events as E
import Http
import Json.Decode as Json
import Managing.Request.RemoteData as RemoteData
import Managing.Users.Data.UserDetail exposing (UserDetail)
import Managing.Users.Data.Shared exposing (AccessGroup(..), accessGroupToString, accessGroupToInt, decodeAccessGroup)
import Managing.Utils.DateUtils as DateUtils
import Managing.View.Loading exposing (spinner)
import Managing.View.Input as Input
import Managing.View.DataTable as DataTable


-- MODEL


type alias Model =
    { userDetail : RemoteData.RemoteData UserDetail
    , id : Maybe Int
    }


init : Model
init =
    Model RemoteData.Loading Nothing


initCmd : Int -> Cmd Msg
initCmd userId =
    getUserDetail userId



-- UPDATE


type Msg
    = ReceiveUserDetail (Result Http.Error UserDetail)
    | TriggerMessageToParent String
    | ChangeAccessGroup AccessGroup


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

        ChangeAccessGroup group ->
            case model.userDetail of
                RemoteData.Available user ->
                    let
                        updatedUserDetail =
                            { user | group = group }
                    in
                        ( { model | userDetail = RemoteData.Available updatedUserDetail }, Cmd.none, Nothing )

                _ ->
                    ( model, Cmd.none, Nothing )



-- VIEW


view : Model -> Html Msg
view model =
    case model.userDetail of
        RemoteData.Loading ->
            spinner

        RemoteData.Available user ->
            -- TODO: add a save button somewhere here
            H.div [] [ displayUserDetail user ]

        RemoteData.Error e ->
            H.div [] [ H.text <| "An error ocurred: " ++ (toString e) ]


displayUserDetail : UserDetail -> Html Msg
displayUserDetail user =
    let
        labelsWithElements =
            [ ( "ID", H.text (toString user.id) )
            , ( "Email", H.text user.email )
            , ( "Group", accessGroupSelectElement user.group )
            , ( "Phone", H.text (Maybe.withDefault "" user.phone) )
            , ( "Last Sign-in Date", H.text (DateUtils.toDisplayString user.lastSigninDate) )
            ]
    in
        labelsWithElements
            |> List.map (\( label, contentElement ) -> DataTable.field label contentElement)
            |> DataTable.item



-- AccessGroup select


accessGroupToSelectOption : AccessGroup -> Input.SelectOption
accessGroupToSelectOption group =
    Input.toSelectOption
        { label = accessGroupToString group
        , value = toString << accessGroupToInt <| group
        }


tryParseInt : String -> Json.Decoder Int
tryParseInt val =
    case String.toInt val of
        Ok val ->
            Json.succeed val

        Err err ->
            Json.fail err


accessGroupSelectElement : AccessGroup -> Html Msg
accessGroupSelectElement selectedGroup =
    let
        decodeAccessGroupFromEvent : Json.Decoder AccessGroup
        decodeAccessGroupFromEvent =
            Json.at [ "target", "value" ] Json.string
                |> Json.andThen tryParseInt
                |> Json.andThen decodeAccessGroup
    in
        Input.select
            { label = "Group"
            , isEditable = True
            , isLabelHidden = True
            }
            [ accessGroupToSelectOption UserGroup
            , accessGroupToSelectOption EmployeeGroup
            , accessGroupToSelectOption EmployerGroup
            , accessGroupToSelectOption AdminGroup
            ]
            (accessGroupToSelectOption selectedGroup)
            (E.on "change" (Json.map ChangeAccessGroup decodeAccessGroupFromEvent))



-- HTTP


getUserDetail : Int -> Cmd Msg
getUserDetail id =
    let
        url =
            "/api/users/" ++ toString id
    in
        Http.send ReceiveUserDetail (Http.get url Managing.Users.Data.UserDetail.decode)
