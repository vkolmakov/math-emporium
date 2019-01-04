module Managing.CalendarCheck.Page.CalendarCheck exposing
    ( Model
    , Msg
    , OutMsg(..)
    , init
    , initCmd
    , update
    , view
    )

import Html as H exposing (Html)
import Html.Attributes as A
import Html.Events as E
import Json.Decode as Json
import Managing.AppConfig exposing (AppConfig)
import Managing.Styles as Styles
import Managing.Utils.Date as Date exposing (Date, TimezoneOffset)
import Managing.Utils.RemoteData as RemoteData exposing (RemoteData)
import Managing.View.Input as Input



-- MODEL


type alias Location =
    { id : Int
    , name : String
    }


type alias CalendarCheckResult =
    { stuff : String
    }


type alias Model =
    { appConfig : AppConfig
    , locations : RemoteData (List Location)
    , selectedStartDate : Maybe Date
    , selectedEndDate : Maybe Date
    , selectedLocation : Maybe Location
    , calendarCheckResult : RemoteData CalendarCheckResult
    }


init : AppConfig -> Model
init appConfig =
    Model appConfig RemoteData.NotRequested Nothing Nothing Nothing RemoteData.NotRequested



-- UPDATE


type Msg
    = StartDateChange String
    | EndDateChange String
    | NoOp


type OutMsg
    = NoOpOutMsg


initCmd : Model -> Cmd Msg
initCmd model =
    Cmd.none


getUpdatedDate : String -> Maybe Date
getUpdatedDate dateString =
    String.toInt dateString
        |> Maybe.map Date.timestampToDate


update : Msg -> Model -> ( Model, Cmd Msg, Maybe OutMsg )
update msg model =
    case msg of
        StartDateChange startDateString ->
            ( { model | selectedStartDate = getUpdatedDate startDateString }, Cmd.none, Nothing )

        EndDateChange endDateString ->
            ( { model | selectedEndDate = getUpdatedDate endDateString }, Cmd.none, Nothing )

        NoOp ->
            ( model, Cmd.none, Nothing )



-- VIEW


view : Model -> Html Msg
view model =
    H.div [] [ viewInputs model, viewCalendarCheckResult model.calendarCheckResult ]


viewCalendarCheckResult : RemoteData CalendarCheckResult -> Html Msg
viewCalendarCheckResult calendarCheckResult =
    H.div [] [ H.text "Here's the calendar check result" ]


noValueOption =
    Input.toSelectOption { label = "", value = "" }


viewDatePicker : TimezoneOffset -> String -> Maybe Date -> (String -> msg) -> Html msg
viewDatePicker timezoneOffset label maybeValue onChangeMsg =
    let
        dateString =
            maybeValue
                |> Maybe.map (Date.toDebugTimestampString timezoneOffset)
                |> Maybe.withDefault ""
    in
    Input.text { isEditable = True, isLabelHidden = False, label = label } dateString onChangeMsg


viewInputs : Model -> Html Msg
viewInputs model =
    let
        { selectedLocation, locations, appConfig, selectedStartDate, selectedEndDate } =
            model

        locationToSelectOption location =
            Input.toSelectOption { label = location.name, value = String.fromInt location.id }

        selectedLocationOption =
            selectedLocation
                |> Maybe.map locationToSelectOption
                |> Maybe.withDefault noValueOption

        locationsList =
            locations
                |> RemoteData.withDefault []

        locationSelectOptions =
            noValueOption :: List.map locationToSelectOption locationsList

        viewLocationSelect =
            Input.select
                { isEditable = True, isLabelHidden = False, label = "Location" }
                locationSelectOptions
                selectedLocationOption
                (E.on "change" (Json.succeed NoOp))
    in
    H.div [ Styles.apply [ Styles.calendarCheck.inputContainer ] ]
        [ viewLocationSelect
        , viewDatePicker appConfig.localTimezoneOffsetInMinutes "Start Date" selectedStartDate StartDateChange
        , viewDatePicker appConfig.localTimezoneOffsetInMinutes "End Date" selectedEndDate EndDateChange
        ]



-- HTTP
-- TODO: add locations fetch and make it a part of initCmd
