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
import Managing.AppConfig exposing (AppConfig)
import Managing.Request.RemoteData as RemoteData exposing (RemoteData)
import Managing.View.DataTable as DataTable
import Managing.View.Input as Input
import Managing.View.Loading exposing (spinner)
import Managing.View.PageError as PageError



-- MODEL


type alias Settings =
    { applicationTitle : String
    , applicationMainHomePictureLink : String
    }


type alias Model =
    { appConfig : AppConfig
    , settings : RemoteData Settings
    }


init : AppConfig -> Model
init appConfig =
    Model appConfig RemoteData.Requested



-- UPDATE


type Msg
    = ReceiveSettings (Result Http.Error Settings)
    | Retry RemoteRequestItem
    | CheckIfTakingTooLong RemoteRequestItem
    | OnApplicationTitleChange String
    | NoOp


type OutMsg
    = NoOpOutMsg


type RemoteRequestItem
    = SettingsRequest


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
            case model.settings of
                RemoteData.Requested ->
                    ( { model | settings = RemoteData.StillLoading }
                    , Cmd.none
                    , Nothing
                    )

                _ ->
                    noOp

        Retry SettingsRequest ->
            ( initialModel
            , initCmd initialModel
            , Nothing
            )

        OnApplicationTitleChange updatedApplicationTitle ->
            let
                updateSettings s =
                    { s | applicationTitle = updatedApplicationTitle }
            in
            ( { model | settings = RemoteData.map updateSettings model.settings }
            , Cmd.none
            , Nothing
            )

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
                [ viewSettings settings
                ]

        RemoteData.Error err ->
            PageError.viewPageError (Retry SettingsRequest) err


viewSettings : Settings -> Html Msg
viewSettings settings =
    let
        labelsWithElements =
            [ ( "Application Title", viewTextInputField "Application Title" settings.applicationTitle OnApplicationTitleChange ) ]

        fields =
            labelsWithElements
                |> List.map (\( label, contentElement ) -> DataTable.field label contentElement)
    in
    fields
        |> DataTable.item


viewTextInputField label initialValue onInput =
    Input.text { isEditable = True, isLabelHidden = True, label = label } initialValue onInput



-- HTTP


getSettings : Cmd Msg
getSettings =
    let
        url =
            "/api/settings"
    in
    Http.send ReceiveSettings (Http.get url decodeSettings)


decodeSettings =
    Json.map2 Settings
        (Json.field "applicationTitle" Json.string)
        (Json.field "applicationMainHomePictureLink" Json.string)
