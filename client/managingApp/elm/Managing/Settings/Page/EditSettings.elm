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
import Managing.Utils.RemoteData as RemoteData exposing (RemoteData)
import Managing.Utils.Browser exposing (attemptFocus)
import Managing.View.Button as Button
import Managing.View.DataTable as DataTable
import Managing.View.Input as Input
import Managing.View.Loading exposing (spinner)
import Managing.View.PageError as PageError
import Managing.View.Persistence as Persistence


submitSettingsButtonId =
    "submit-settings-button"


defaultMaximumAppointmentsPerUser =
    5



-- MODEL


type alias Settings =
    { applicationTitle : String
    , applicationMainHomePictureLink : String
    , duplicateAllEmailsTo : String
    , faqText : String
    , maximumAppointmentsPerUser : Maybe Int
    , announcementText : String
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
    { message : String }


type Msg
    = ReceiveSettings (Result Http.Error Settings)
    | Retry RemoteRequestItem
    | CheckIfTakingTooLong RemoteRequestItem
    | OnFieldValueChange Field String
    | PersistSettings Settings
    | ReceiveSettingsPersistenceResponse (Result Http.Error SettingsPersistenceResponse)
    | NoOp


type Field
    = ApplicationTitleField
    | ApplicationMainHomePictureLinkField
    | DuplicateAllEmailsToField
    | FaqTextField
    | MaximumAppointmentsPerUserChangeField
    | AnnouncementTextField


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

        OnFieldValueChange field updatedValue ->
            let
                updateSettings s =
                    case field of
                        ApplicationTitleField ->
                            { s | applicationTitle = updatedValue }

                        ApplicationMainHomePictureLinkField ->
                            { s | applicationMainHomePictureLink = updatedValue }

                        DuplicateAllEmailsToField ->
                            { s | duplicateAllEmailsTo = updatedValue }

                        FaqTextField ->
                            { s | faqText = updatedValue }

                        MaximumAppointmentsPerUserChangeField ->
                            { s | maximumAppointmentsPerUser = String.toInt updatedValue }

                        AnnouncementTextField ->
                            { s | announcementText = updatedValue }
            in
            ( { model | settings = RemoteData.map updateSettings model.settings }
            , Cmd.none
            , Nothing
            )

        PersistSettings settings ->
            ( { model | settingsPersistenceState = RemoteData.Requested }
            , Cmd.batch
                [ persistSettings settings
                , RemoteData.scheduleLoadingStateTrigger (CheckIfTakingTooLong SettingsPersistenceRequest)
                ]
            , Nothing
            )

        ReceiveSettingsPersistenceResponse (Ok response) ->
            ( { model | settingsPersistenceState = RemoteData.Available response }
            , attemptFocus NoOp submitSettingsButtonId
            , Nothing
            )

        ReceiveSettingsPersistenceResponse (Err err) ->
            ( { model | settingsPersistenceState = RemoteData.Error (RemoteData.errorFromHttpError err) }
            , attemptFocus NoOp submitSettingsButtonId
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
                [ viewSettings settings model.settingsPersistenceState
                ]

        RemoteData.Error err ->
            PageError.viewPageError (Retry SettingsRequest) err


viewSettings : Settings -> RemoteData SettingsPersistenceResponse -> Html Msg
viewSettings settings settingsPersistenceState =
    let
        maximumNumberOfAppointmentsPerUserString =
            case settings.maximumAppointmentsPerUser of
                Just n ->
                    String.fromInt n

                Nothing ->
                    ""

        labelsWithElements =
            [ ( "Application Title"
              , viewTextInputField "Application Title" settings.applicationTitle (OnFieldValueChange ApplicationTitleField)
              )
            , ( "Main Home Picture Link"
              , viewTextInputField "Main Home Picture Link" settings.applicationMainHomePictureLink (OnFieldValueChange ApplicationMainHomePictureLinkField)
              )
            , ( "Duplicate All Emails to Address"
              , viewTextInputField "Duplicate All Emails to Address" settings.duplicateAllEmailsTo (OnFieldValueChange DuplicateAllEmailsToField)
              )
            , ( "FAQ Text"
              , viewTextAreaField "FAQ Text" settings.faqText (OnFieldValueChange FaqTextField)
              )
            , ( "Maximum Appointments per User"
              , viewTextInputField "Maximum Appointments per User" maximumNumberOfAppointmentsPerUserString (OnFieldValueChange MaximumAppointmentsPerUserChangeField)
              )
            , ( "Announcement Text"
              , viewTextAreaField "Announcement Text" settings.announcementText (OnFieldValueChange AnnouncementTextField)
              )
            ]

        fields =
            labelsWithElements
                |> List.map (\( label, contentElement ) -> DataTable.field label contentElement)

        actions =
            [ DataTable.actionContainer
                [ Persistence.view submitSettingsButtonId (PersistSettings settings) settingsPersistenceState ]
            ]
    in
    (fields ++ actions)
        |> DataTable.item


viewTextInputField label initialValue onInput =
    Input.text { isEditable = True, isLabelHidden = True, label = label } initialValue onInput


viewTextAreaField label initialValue onInput =
    Input.longText { isEditable = True, isLabelHidden = True, label = label } initialValue onInput



-- HTTP


getSettings : Cmd Msg
getSettings =
    let
        url =
            "/api/settings"
    in
    Http.send ReceiveSettings (Http.get url decodeSettings)


decodeSettings =
    Json.map6 Settings
        (Json.field "applicationTitle" Json.string)
        (Json.field "applicationMainHomePictureLink" Json.string)
        (Json.field "duplicateAllEmailsTo" Json.string)
        (Json.field "faqText" Json.string)
        (Json.field "maximumAppointmentsPerUser" (Json.nullable Json.int))
        (Json.field "announcementText" Json.string)


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


encodeSettings : Settings -> Json.Encode.Value
encodeSettings settings =
    Json.Encode.object
        [ ( "applicationTitle", Json.Encode.string settings.applicationTitle )
        , ( "applicationMainHomePictureLink", Json.Encode.string settings.applicationMainHomePictureLink )
        , ( "duplicateAllEmailsTo", Json.Encode.string settings.duplicateAllEmailsTo )
        , ( "faqText", Json.Encode.string settings.faqText )
        , ( "maximumAppointmentsPerUser", Json.Encode.int (Maybe.withDefault defaultMaximumAppointmentsPerUser settings.maximumAppointmentsPerUser) )
        , ( "announcementText", Json.Encode.string settings.announcementText )
        ]


decodeSettingsPersistenceResponse : Json.Decoder SettingsPersistenceResponse
decodeSettingsPersistenceResponse =
    Json.map SettingsPersistenceResponse
        (Json.field "message" Json.string)
