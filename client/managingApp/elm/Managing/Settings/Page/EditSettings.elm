module Managing.Settings.Page.EditSettings exposing
    ( Model
    , Msg
    , OutMsg(..)
    , init
    , initCmd
    , update
    , view
    )

import Html as H exposing (Html)
import Http
import Json.Decode as Json
import Json.Encode
import Managing.AppConfig exposing (AppConfig)
import Managing.Request.RemoteData as RemoteData exposing (RemoteData)
import Managing.View.Button as Button
import Managing.View.DataTable as DataTable
import Managing.View.Input as Input
import Managing.View.Loading exposing (spinner)
import Managing.View.PageError as PageError


submitSettingsButtonId =
    "submit-settings-button"



-- MODEL


type alias Settings =
    { applicationTitle : String
    , applicationMainHomePictureLink : String
    }


type alias Model =
    { appConfig : AppConfig
    , settings : RemoteData Settings
    , settingsPersistenceState : RemoteData SettingsPersistenceResponse
    }


init : AppConfig -> Model
init appConfig =
    Model appConfig RemoteData.Requested RemoteData.NotRequested



-- UPDATE


type alias SettingsPersistenceResponse =
    String


type Msg
    = ReceiveSettings (Result Http.Error Settings)
    | Retry RemoteRequestItem
    | CheckIfTakingTooLong RemoteRequestItem
    | OnApplicationTitleChange String
    | PersistSettings Settings
    | ReceiveSettingsPersistenceResponse (Result Http.Error SettingsPersistenceResponse)
    | NoOp


type OutMsg
    = NoOpOutMsg


type RemoteRequestItem
    = SettingsRequest
    | SettingsPersistenceRequest


initCmd : Model -> Cmd Msg
initCmd model =
    Cmd.batch
        [ getSettings
        , RemoteData.scheduleLoadingStateTrigger (CheckIfTakingTooLong SettingsRequest)
        ]


update : Msg -> Model -> ( Model, Cmd Msg, Maybe OutMsg )
update msg model =
    let
        noOp =
            ( model, Cmd.none, Nothing )

        initialModel =
            init model.appConfig
    in
    case msg of
        ReceiveSettings (Err err) ->
            ( { model | settings = RemoteData.Error <| RemoteData.errorFromHttpError err }
            , Cmd.none
            , Nothing
            )

        ReceiveSettings (Ok settings) ->
            ( { model | settings = RemoteData.Available settings }
            , Cmd.none
            , Nothing
            )

        CheckIfTakingTooLong SettingsRequest ->
            ( { model | settings = RemoteData.checkIfTakingTooLong model.settings }
            , Cmd.none
            , Nothing
            )

        CheckIfTakingTooLong SettingsPersistenceRequest ->
            ( { model | settingsPersistenceState = RemoteData.checkIfTakingTooLong model.settingsPersistenceState }
            , Cmd.none
            , Nothing
            )

        Retry SettingsRequest ->
            ( initialModel
            , initCmd initialModel
            , Nothing
            )

        Retry SettingsPersistenceRequest ->
            -- this should never happen since retries
            -- will be handled through PersistSettings
            noOp

        OnApplicationTitleChange updatedApplicationTitle ->
            let
                updateSettings s =
                    { s | applicationTitle = updatedApplicationTitle }
            in
            ( { model | settings = RemoteData.map updateSettings model.settings }
            , Cmd.none
            , Nothing
            )

        PersistSettings settings ->
            ( model
            , Cmd.batch
                [ persistSettings settings
                , RemoteData.scheduleLoadingStateTrigger (CheckIfTakingTooLong SettingsPersistenceRequest)
                ]
            , Nothing
            )

        ReceiveSettingsPersistenceResponse (Ok _) ->
            noOp

        ReceiveSettingsPersistenceResponse (Err _) ->
            noOp

        NoOp ->
            noOp



-- VIEW


view : Model -> Html Msg
view model =
    case model.settings of
        RemoteData.Requested ->
            H.div [] []

        RemoteData.NotRequested ->
            H.div [] []

        RemoteData.StillLoading ->
            spinner

        RemoteData.Available settings ->
            DataTable.table
                [ viewSettings settings model.settingsPersistenceState
                ]

        RemoteData.Error err ->
            PageError.viewPageError (Retry SettingsRequest) err


viewSettings : Settings -> RemoteData SettingsPersistenceResponse -> Html Msg
viewSettings settings settingsPersistenceState =
    let
        labelsWithElements =
            [ ( "Application Title", viewTextInputField "Application Title" settings.applicationTitle OnApplicationTitleChange ) ]

        fields =
            labelsWithElements
                |> List.map (\( label, contentElement ) -> DataTable.field label contentElement)

        actions =
            [ DataTable.actionContainer
                [ viewSubmitSettingsButton settings settingsPersistenceState ]
            ]
    in
    (fields ++ actions)
        |> DataTable.item


viewTextInputField label initialValue onInput =
    Input.text { isEditable = True, isLabelHidden = True, label = label } initialValue onInput


viewSubmitSettingsButton : Settings -> RemoteData SettingsPersistenceResponse -> Html Msg
viewSubmitSettingsButton settings settingsPersistenceState =
    let
        buttonLabel =
            "Submit"

        buttonMsg =
            PersistSettings settings

        buttonState =
            case settingsPersistenceState of
                RemoteData.StillLoading ->
                    Button.Loading

                RemoteData.Requested ->
                    Button.Disabled

                _ ->
                    Button.Enabled
    in
    Button.view buttonLabel submitSettingsButtonId buttonState buttonMsg



-- HTTP


getSettings : Cmd Msg
getSettings =
    let
        url =
            "/api/settings"
    in
    Http.send ReceiveSettings (Http.get url decodeSettings)


encodeSettings : Settings -> Json.Encode.Value
encodeSettings settings =
    Json.Encode.object []


decodeSettingsPersistenceResponse : Json.Decoder SettingsPersistenceResponse
decodeSettingsPersistenceResponse =
    Json.string


persistSettings : Settings -> Cmd Msg
persistSettings settings =
    let
        url =
            "/api/settings"

        body =
            Http.jsonBody <| encodeSettings settings

        request =
            Http.request
                { method = "PUT"
                , headers = []
                , url = url
                , body = body
                , expect = Http.expectJson decodeSettingsPersistenceResponse
                , timeout = Nothing
                , withCredentials = False
                }
    in
    Http.send ReceiveSettingsPersistenceResponse request


decodeSettings =
    Json.map2 Settings
        (Json.field "applicationTitle" Json.string)
        (Json.field "applicationMainHomePictureLink" Json.string)
