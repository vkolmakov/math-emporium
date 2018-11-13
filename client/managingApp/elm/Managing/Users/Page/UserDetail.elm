module Managing.Users.Page.UserDetail exposing (Model, Msg, OutMsg(..), init, initCmd, update, view)

import Browser.Dom as Dom
import Html.Styled as H exposing (Attribute, Html)
import Html.Styled.Events as E
import Http
import Json.Decode as Json
import Json.Encode
import Managing.Request.RemoteData as RemoteData
import Managing.Styles as Styles
import Managing.Users.Data.Shared exposing (AccessGroup(..), accessGroupToInt, accessGroupToString, decodeAccessGroup)
import Managing.Users.Data.UserDetail exposing (UserDetail)
import Managing.Utils.Date as Date
import Managing.View.Button as Button
import Managing.View.DataTable as DataTable
import Managing.View.Input as Input
import Managing.View.Loading exposing (spinner)
import Process
import Task


submitButtonId =
    "button-submit"



-- MODEL


type PersistenceState
    = NotRequested
    | Requested
    | StillLoading
    | Done
    | Failed RemoteData.RemoteDataError


type alias Model =
    { userDetail : RemoteData.RemoteData UserDetail
    , userDetailVolatile : UserDetailVolatile
    , userPersistenceState : PersistenceState
    , id : Maybe Int
    }


type alias UserRef =
    { id : Int }


type alias UserDetailVolatile =
    { group : Maybe AccessGroup }


init : Model
init =
    Model RemoteData.Loading { group = Nothing } NotRequested Nothing


initCmd : Int -> Cmd Msg
initCmd userId =
    getUserDetail userId



-- UPDATE


type Msg
    = ReceiveUserDetail (Result Http.Error UserDetail)
    | PersistUserDetail Int UserDetailVolatile
    | ReceiveUserPersistenceDetailResponse (Result Http.Error UserRef)
    | CheckIfPersistenceCallTakingTooLong
    | TriggerMessageToParent String
    | ChangeAccessGroup AccessGroup
    | NoOp


type OutMsg
    = DoStuffToParent String


update : Msg -> Model -> ( Model, Cmd Msg, Maybe OutMsg )
update msg model =
    case msg of
        ReceiveUserDetail (Ok user) ->
            ( { model | id = Just user.id, userDetail = RemoteData.Available user }, Cmd.none, Nothing )

        ReceiveUserDetail (Err e) ->
            ( { model | userDetail = RemoteData.Error (RemoteData.OtherError <| Debug.toString e) }, Cmd.none, Nothing )

        TriggerMessageToParent s ->
            ( model, Cmd.none, Just (DoStuffToParent s) )

        ChangeAccessGroup group ->
            case model.userDetail of
                RemoteData.Available user ->
                    let
                        previousUserDetailVolatile =
                            model.userDetailVolatile

                        updatedUserDetailVolatile =
                            { previousUserDetailVolatile | group = Just group }
                    in
                    ( { model | userDetailVolatile = updatedUserDetailVolatile }, Cmd.none, Nothing )

                _ ->
                    ( model, Cmd.none, Nothing )

        CheckIfPersistenceCallTakingTooLong ->
            case model.userPersistenceState of
                Requested ->
                    ( { model | userPersistenceState = StillLoading }, Cmd.none, Nothing )

                _ ->
                    ( model, Cmd.none, Nothing )

        PersistUserDetail id user ->
            ( { model | userPersistenceState = Requested }
            , Cmd.batch
                [ persistUserDetail id user
                , Process.sleep 150 |> Task.perform (always CheckIfPersistenceCallTakingTooLong)
                ]
            , Nothing
            )

        ReceiveUserPersistenceDetailResponse (Ok _) ->
            ( { model | userPersistenceState = Done }
            , attemptFocus submitButtonId
            , Nothing
            )

        ReceiveUserPersistenceDetailResponse (Err e) ->
            ( { model | userPersistenceState = Failed (RemoteData.OtherError <| Debug.toString e) }
            , attemptFocus submitButtonId
            , Nothing )

        NoOp ->
            ( model, Cmd.none, Nothing )


attemptFocus elementId =
    Task.attempt (\_ -> NoOp) (Dom.focus elementId)



-- VIEW


view : Model -> Html Msg
view model =
    case model.userDetail of
        RemoteData.Loading ->
            spinner

        RemoteData.Available user ->
            -- TODO: add a submit button somewhere here
            H.div [ Styles.detailContainer ]
                [ displayUserDetail user
                , submitUserDetail user.id model.userDetailVolatile model.userPersistenceState
                ]

        RemoteData.Error e ->
            H.div [] [ H.text <| "An error ocurred: " ++ Debug.toString e ]


submitUserDetail : Int -> UserDetailVolatile -> PersistenceState -> Html Msg
submitUserDetail id user userPersistenceState =
    let
        buttonMsg =
            PersistUserDetail id user

        buttonLabel =
            "Submit"

        buttonState =
            case userPersistenceState of
                StillLoading ->
                    Button.Loading

                Requested ->
                    Button.Disabled

                _ ->
                    Button.Enabled
    in
    H.div
        [ Styles.rightAlignedContainer
        ]
        [ Button.view buttonLabel submitButtonId buttonState buttonMsg ]


displayUserDetail : UserDetail -> Html Msg
displayUserDetail user =
    let
        labelsWithElements =
            [ ( "ID", H.text (String.fromInt user.id) )
            , ( "Email", H.text user.email )
            , ( "Group", accessGroupSelectElement user.group )
            , ( "Phone", H.text (Maybe.withDefault "" user.phone) )
            , ( "Last Sign-in Date", H.text (Date.toDisplayString user.lastSigninDate) )
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
        , value = Debug.toString << accessGroupToInt <| group
        }


tryParseInt : String -> Json.Decoder Int
tryParseInt val =
    case String.toInt val of
        Just num ->
            Json.succeed num

        Nothing ->
            Json.fail "Invalid integer"


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
            "/api/users/" ++ String.fromInt id
    in
    Http.send ReceiveUserDetail (Http.get url Managing.Users.Data.UserDetail.decode)


decodeUserRef =
    Json.map UserRef
        (Json.field "id" Json.int)


getValuesOnly : List (Maybe a) -> List a
getValuesOnly maybeValues =
    let
        go acc remaining =
            case remaining of
                (Just x) :: xs ->
                    go (x :: acc) xs

                Nothing :: xs ->
                    go acc xs

                [] ->
                    List.reverse acc
    in
    go [] maybeValues


fieldDescriptionToTuple ( maybePropertyValue, propertyKey, encoder ) =
    case maybePropertyValue of
        Just propertyValue ->
            Just ( propertyKey, encoder propertyValue )

        Nothing ->
            Nothing


encodeUserDetailVolatile : UserDetailVolatile -> Json.Encode.Value
encodeUserDetailVolatile user =
    let
        fieldDescriptions =
            [ ( user.group, "group", \val -> Json.Encode.int <| accessGroupToInt val ) ]

        fields =
            fieldDescriptions
                |> List.map fieldDescriptionToTuple
                |> getValuesOnly
    in
    Json.Encode.object fields


persistUserDetail : Int -> UserDetailVolatile -> Cmd Msg
persistUserDetail id user =
    let
        url =
            "/api/users/" ++ String.fromInt id

        body =
            Http.jsonBody <| encodeUserDetailVolatile user

        request =
            Http.request
                { method = "PUT"
                , headers = []
                , url = url
                , body = body
                , expect = Http.expectJson decodeUserRef
                , timeout = Nothing
                , withCredentials = False
                }
    in
    Http.send ReceiveUserPersistenceDetailResponse request
