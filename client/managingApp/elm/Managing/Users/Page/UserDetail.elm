module Managing.Users.Page.UserDetail exposing (Model, Msg, OutMsg(..), init, initCmd, update, view)

import Html as H exposing (Attribute, Html)
import Html.Events as E
import Http
import Json.Decode as Json
import Json.Encode
import Managing.AppConfig exposing (AppConfig)
import Managing.Request.RemoteData as RemoteData exposing (RemoteData)
import Managing.Styles as Styles
import Managing.Users.Data.Shared exposing (AccessGroup(..), accessGroupToInt, accessGroupToString, decodeAccessGroup)
import Managing.Users.Data.UserDetail exposing (UserDetail)
import Managing.Utils.Browser exposing (attemptFocus)
import Managing.Utils.Date as Date
import Managing.View.Button as Button
import Managing.View.DataTable as DataTable
import Managing.View.Input as Input
import Managing.View.Loading exposing (spinner)
import Managing.View.Persistence as Persistence


submitButtonId =
    "button-submit"



-- MODEL


type alias Model =
    { appConfig : AppConfig
    , userDetail : RemoteData.RemoteData UserDetail
    , userDetailVolatile : UserDetailVolatile
    , userPersistenceState : RemoteData UserRef
    , id : Maybe Int
    }


type alias UserRef =
    { id : Int }


type alias UserDetailVolatile =
    { group : Maybe AccessGroup }


init : AppConfig -> Model
init appConfig =
    Model
        appConfig
        RemoteData.Requested
        { group = Nothing }
        RemoteData.NotRequested
        Nothing


type RemoteRequestItem
    = UserDetailRequest
    | UserPersistenceRequest


initCmd : Int -> Cmd Msg
initCmd userId =
    Cmd.batch
        [ getUserDetail userId
        , RemoteData.scheduleLoadingStateTrigger (CheckIfTakingTooLong UserDetailRequest)
        ]



-- UPDATE


type Msg
    = ReceiveUserDetail (Result Http.Error UserDetail)
    | PersistUserDetail Int UserDetailVolatile
    | ReceiveUserPersistenceDetailResponse (Result Http.Error UserRef)
    | CheckIfTakingTooLong RemoteRequestItem
    | TriggerMessageToParent String
    | ChangeAccessGroup AccessGroup
    | NoOp


type OutMsg
    = DoStuffToParent String


update : Msg -> Model -> ( Model, Cmd Msg, Maybe OutMsg )
update msg model =
    case msg of
        ReceiveUserDetail (Ok user) ->
            noAction { model | id = Just user.id, userDetail = RemoteData.Available user }

        ReceiveUserDetail (Err e) ->
            noAction { model | userDetail = RemoteData.Error <| RemoteData.errorFromHttpError e }

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
                    noAction { model | userDetailVolatile = updatedUserDetailVolatile }

                _ ->
                    noAction model

        CheckIfTakingTooLong UserDetailRequest ->
            ( { model | userDetail = RemoteData.checkIfTakingTooLong model.userDetail }
            , Cmd.none
            , Nothing
            )

        CheckIfTakingTooLong UserPersistenceRequest ->
            ( { model | userPersistenceState = RemoteData.checkIfTakingTooLong model.userPersistenceState }
            , Cmd.none
            , Nothing
            )

        PersistUserDetail id user ->
            ( { model | userPersistenceState = RemoteData.Requested }
            , Cmd.batch
                [ persistUserDetail id user
                , RemoteData.scheduleLoadingStateTrigger (CheckIfTakingTooLong UserPersistenceRequest)
                ]
            , Nothing
            )

        ReceiveUserPersistenceDetailResponse (Ok userRef) ->
            ( { model | userPersistenceState = RemoteData.Available userRef }
            , attemptFocus NoOp submitButtonId
            , Nothing
            )

        ReceiveUserPersistenceDetailResponse (Err e) ->
            ( { model | userPersistenceState = RemoteData.Error <| RemoteData.errorFromHttpError e }
            , attemptFocus NoOp submitButtonId
            , Nothing
            )

        NoOp ->
            noAction model


noAction model =
    ( model, Cmd.none, Nothing )



-- VIEW


view : Model -> Html Msg
view model =
    case model.userDetail of
        RemoteData.Requested ->
            H.div [] []

        RemoteData.NotRequested ->
            H.div [] []

        RemoteData.StillLoading ->
            spinner

        RemoteData.Available user ->
            DataTable.table
                [ displayUserDetail model user
                ]

        RemoteData.Error e ->
            H.div [] [ H.text <| "An error ocurred: " ++ Debug.toString e ]


submitUserDetail : Int -> UserDetailVolatile -> RemoteData UserRef -> Html Msg
submitUserDetail id user userPersistenceState =
    Persistence.view submitButtonId (PersistUserDetail id user) userPersistenceState


displayUserDetail : Model -> UserDetail -> Html Msg
displayUserDetail model user =
    let
        { appConfig, userDetailVolatile, userPersistenceState } =
            model

        labelsWithElements =
            [ ( "ID", H.text (String.fromInt user.id) )
            , ( "Email", H.text user.email )
            , ( "Group", accessGroupSelectElement user.group )
            , ( "Phone", H.text (Maybe.withDefault "" user.phone) )
            , ( "Last Sign-in Date", H.text (Date.toDisplayString appConfig.localTimezoneOffsetInMinutes user.lastSigninDate) )
            ]

        fields =
            labelsWithElements
                |> List.map (\( label, contentElement ) -> DataTable.field label contentElement)

        actions =
            DataTable.actionContainer
                [ submitUserDetail user.id userDetailVolatile userPersistenceState
                ]
    in
    (fields ++ [ actions ])
        |> DataTable.item



-- AccessGroup select


accessGroupToSelectOption : AccessGroup -> Input.SelectOption
accessGroupToSelectOption group =
    Input.toSelectOption
        { label = accessGroupToString group
        , value = String.fromInt << accessGroupToInt <| group
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
