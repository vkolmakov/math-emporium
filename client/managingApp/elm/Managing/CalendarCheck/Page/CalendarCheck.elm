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
import Html.Events as E
import Http
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


type RemoteDataRequest
    = LocationsRequest
    | CalendarCheckResultRequest


type DatePickerDateValue
    = DatePickerDateValue String


type Msg
    = StartDateChange DatePickerDateValue
    | EndDateChange DatePickerDateValue
    | SelectedLocationChange (Maybe Location)
    | ReceiveLocations (Result Http.Error (List Location))
    | ReceiveCalendarCheckResult (Result Http.Error CalendarCheckResult)
    | CheckIfTakingTooLong RemoteDataRequest
    | NoOp


type OutMsg
    = NoOpOutMsg


initCmd : Model -> Cmd Msg
initCmd model =
    let
        fetchData =
            Cmd.batch
                [ getLocations
                , RemoteData.scheduleLoadingStateTrigger (CheckIfTakingTooLong LocationsRequest)
                ]
    in
    case model.locations of
        RemoteData.NotRequested ->
            fetchData

        RemoteData.Requested ->
            fetchData

        RemoteData.StillLoading ->
            Cmd.none

        RemoteData.Error _ ->
            Cmd.none

        RemoteData.Available _ ->
            Cmd.none


getUpdatedDate : DatePickerDateValue -> Maybe Date
getUpdatedDate (DatePickerDateValue dateString) =
    String.toInt dateString
        |> Maybe.map Date.timestampToDate


attemptCalendarCheckRequest : Maybe Location -> Maybe Date -> Maybe Date -> Cmd Msg
attemptCalendarCheckRequest selectedLocation selectedStartDate selectedEndDate =
    case ( selectedLocation, selectedStartDate, selectedEndDate ) of
        ( Just location, Just startDate, Just endDate ) ->
            Cmd.batch
                [ RemoteData.scheduleLoadingStateTrigger (CheckIfTakingTooLong CalendarCheckResultRequest)
                , getCalendarCheckResult location startDate endDate
                ]

        _ ->
            Cmd.none


update : Msg -> Model -> ( Model, Cmd Msg, Maybe OutMsg )
update msg model =
    case msg of
        StartDateChange value ->
            let
                updatedStartDate =
                    getUpdatedDate value
            in
            ( { model | selectedStartDate = updatedStartDate }
            , attemptCalendarCheckRequest model.selectedLocation updatedStartDate model.selectedEndDate
            , Nothing
            )

        EndDateChange value ->
            let
                updatedEndDate =
                    getUpdatedDate value
            in
            ( { model | selectedEndDate = updatedEndDate }
            , attemptCalendarCheckRequest model.selectedLocation model.selectedStartDate updatedEndDate
            , Nothing
            )

        SelectedLocationChange updatedLocation ->
            ( { model | selectedLocation = updatedLocation }
            , attemptCalendarCheckRequest updatedLocation model.selectedStartDate model.selectedEndDate
            , Nothing
            )

        ReceiveLocations (Err e) ->
            ( { model | locations = RemoteData.Error (RemoteData.errorFromHttpError e) }
            , Cmd.none
            , Nothing
            )

        ReceiveLocations (Ok locations) ->
            ( { model | locations = RemoteData.Available locations }
            , Cmd.none
            , Nothing
            )

        ReceiveCalendarCheckResult (Err e) ->
            ( { model | calendarCheckResult = RemoteData.Error (RemoteData.errorFromHttpError e) }
            , Cmd.none
            , Nothing
            )

        ReceiveCalendarCheckResult (Ok calendarCheckResult) ->
            ( { model | calendarCheckResult = RemoteData.Available calendarCheckResult }
            , Cmd.none
            , Nothing
            )

        CheckIfTakingTooLong LocationsRequest ->
            ( { model | locations = RemoteData.checkIfTakingTooLong model.locations }
            , Cmd.none
            , Nothing
            )

        CheckIfTakingTooLong CalendarCheckResultRequest ->
            ( { model | calendarCheckResult = RemoteData.checkIfTakingTooLong model.calendarCheckResult }
            , Cmd.none
            , Nothing
            )

        NoOp ->
            ( model, Cmd.none, Nothing )



-- VIEW


view : Model -> Html Msg
view model =
    H.div [] [ viewInputs model, viewCalendarCheckResult model.calendarCheckResult ]


viewCalendarCheckResult : RemoteData CalendarCheckResult -> Html Msg
viewCalendarCheckResult calendarCheckResult =
    H.div [] [ H.text "Here's the calendar check result" ]


noValueOption : Input.SelectOption
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

        decodeSelectedLocationFromChangeEvent =
            Json.at [ "target", "value" ] Json.string
                |> Json.andThen (decodeLocationFromRawLocationId locationsList)
                |> Json.map SelectedLocationChange

        viewLocationSelect =
            Input.select
                { isEditable = True, isLabelHidden = False, label = "Location" }
                locationSelectOptions
                selectedLocationOption
                (E.on "change" decodeSelectedLocationFromChangeEvent)
    in
    H.div [ Styles.apply [ Styles.calendarCheck.inputContainer ] ]
        [ viewLocationSelect
        , viewDatePicker appConfig.localTimezoneOffsetInMinutes "Start Date" selectedStartDate (StartDateChange << DatePickerDateValue)
        , viewDatePicker appConfig.localTimezoneOffsetInMinutes "End Date" selectedEndDate (EndDateChange << DatePickerDateValue)
        ]


decodeLocationFromRawLocationId : List Location -> String -> Json.Decoder (Maybe Location)
decodeLocationFromRawLocationId locations rawLocationId =
    let
        find list getAttribute item =
            case list of
                x :: xs ->
                    if getAttribute x == item then
                        Just x

                    else
                        find xs getAttribute item

                [] ->
                    Nothing

        maybeLocationId =
            String.toInt rawLocationId
    in
    maybeLocationId
        |> Maybe.andThen (find locations .id)
        |> Json.succeed



-- HTTP


decodeLocation : Json.Decoder Location
decodeLocation =
    Json.map2
        Location
        (Json.field "id" Json.int)
        (Json.field "name" Json.string)


getLocations : Cmd Msg
getLocations =
    let
        url =
            "/api/locations"
    in
    Http.send
        ReceiveLocations
        (Http.get url (decodeLocation |> Json.list))


decodeCalendarCheckResult : Json.Decoder CalendarCheckResult
decodeCalendarCheckResult =
    Json.succeed (CalendarCheckResult "Hello!")


getCalendarCheckResult : Location -> Date -> Date -> Cmd Msg
getCalendarCheckResult location startDate endDate =
    let
        queryParams =
            [ ( "locationId", String.fromInt location.id )
            , ( "startDate", startDate |> Date.dateToTimestamp |> String.fromInt )
            , ( "endDate", endDate |> Date.dateToTimestamp |> String.fromInt )
            ]

        query =
            queryParams
                |> List.map (\( key, value ) -> key ++ "=" ++ value)
                |> String.join "&"

        url =
            "/api/admin/calendar/check" ++ "?" ++ query
    in
    Http.send
        ReceiveCalendarCheckResult
        (Http.get url decodeCalendarCheckResult)
