port module Managing.CalendarCheck.Page.CalendarCheck exposing
    ( Model
    , Msg
    , OutMsg(..)
    , cleanupCmd
    , init
    , initCmd
    , subscriptions
    , update
    , view
    )

import Html as H exposing (Html)
import Html.Attributes as A
import Html.Events as E
import Http
import Json.Decode as Json
import Managing.AppConfig exposing (AppConfig)
import Managing.Route exposing (CalendarCheckRouteInitialStateQueryParams)
import Managing.Styles as Styles
import Managing.Utils.Date as Date exposing (Date, TimezoneOffset)
import Managing.Utils.RemoteData as RemoteData exposing (RemoteData)
import Managing.Utils.Url as Url exposing (Url)
import Managing.View.DataTable as DataTable
import Managing.View.Input as Input
import Managing.View.Loading exposing (spinner)
import Managing.View.PageMessage as PageMessage exposing (viewPageError, viewPageMessage)


weekPickerInputElementId : String
weekPickerInputElementId =
    "calendar-check-week-picker"



-- MODEL


type alias Location =
    { id : Int
    , name : String
    }


type TutorName
    = TutorName String


type CalendarEventSummary
    = CalendarEventSummary String


type alias CalendarEvent =
    { directCalendarEventLink : Url
    , date : Date
    , summary : CalendarEventSummary
    }


type InvalidAppointmentReason
    = UnrecognizedTutorNameInAppointment TutorName


type alias InvalidAppointmentEntry =
    { calendarEvent : CalendarEvent
    , reason : InvalidAppointmentReason
    }


type InvalidScheduleReason
    = UnrecognizedTutorNamesInSchedule (List TutorName)


type alias InvalidScheduleEntry =
    { calendarEvent : CalendarEvent
    , reason : InvalidScheduleReason
    }


type alias CalendarCheckResult =
    { invalidAppointments : Maybe (List InvalidAppointmentEntry)
    , invalidSchedules : Maybe (List InvalidScheduleEntry)
    , unrecognizedCalendarEvents : Maybe (List CalendarEvent)
    }


type alias Model =
    { appConfig : AppConfig
    , initialSelection : CalendarCheckRouteInitialStateQueryParams
    , locations : RemoteData (List Location)
    , selectedStartDate : Maybe Date
    , selectedLocation : Maybe Location
    , calendarCheckResult : RemoteData CalendarCheckResult
    }


init : AppConfig -> Model
init appConfig =
    Model
        appConfig
        { locationId = Nothing, startDateTimestamp = Nothing, endDateTimestamp = Nothing }
        RemoteData.NotRequested
        Nothing
        Nothing
        RemoteData.NotRequested



-- UPDATE


type RemoteDataRequest
    = LocationsRequest
    | CalendarCheckResultRequest


type DatePickerDateValue
    = DatePickerDateValue String


type Msg
    = StartDateChange DatePickerDateValue
    | SelectedLocationChange (Maybe Location)
    | RequestUpdateCalendarEvent CalendarEvent
    | ReceiveLocations (Result Http.Error (List Location))
    | ReceiveCalendarCheckResult (Result Http.Error CalendarCheckResult)
    | CheckIfTakingTooLong RemoteDataRequest
    | NoOp


type OutMsg
    = RequestOpenNewBrowserTab Url


initCmd : Model -> Cmd Msg
initCmd model =
    let
        fetchData =
            Cmd.batch
                [ getLocations
                , RemoteData.scheduleLoadingStateTrigger (CheckIfTakingTooLong LocationsRequest)
                ]

        startDateSelection =
            -- Prioritize values coming from the model.
            -- If none, check if something was supplied from the query string.
            case model.selectedStartDate of
                Just _ ->
                    model.selectedStartDate |> Maybe.map Date.dateToTimestamp

                Nothing ->
                    model.initialSelection.startDateTimestamp

        initializeDatePickers =
            calendarCheckInitializeWeekPicker
                -- Note that values have to be sent for cases when some values were selected, but user navigated
                -- away from the tab. Values are still alive on the model, but date picker element does not
                -- remember them.
                { pickerInputId = weekPickerInputElementId
                , selectedStartWeekMondayTimestamp = startDateSelection
                }
    in
    case model.locations of
        RemoteData.NotRequested ->
            Cmd.batch
                [ fetchData
                , initializeDatePickers
                ]

        RemoteData.Requested ->
            Cmd.batch
                [ fetchData
                , initializeDatePickers
                ]

        RemoteData.StillLoading ->
            initializeDatePickers

        RemoteData.Error _ ->
            initializeDatePickers

        RemoteData.Available _ ->
            initializeDatePickers


cleanupCmd : Cmd Msg
cleanupCmd =
    calendarCheckCleanupWeekPicker { pickerInputId = weekPickerInputElementId }


getUpdatedDate : DatePickerDateValue -> Maybe Date
getUpdatedDate (DatePickerDateValue dateString) =
    String.toInt dateString
        |> Maybe.map Date.timestampToDate


getWeekEndDate : Date -> Date
getWeekEndDate startDate =
    startDate |> Date.addDays 7


attemptCalendarCheckRequest : Model -> Maybe Location -> Maybe Date -> ( RemoteData CalendarCheckResult, Cmd Msg )
attemptCalendarCheckRequest previousModel selectedLocation selectedStartDate =
    let
        anyValuesUpdated =
            (previousModel.selectedLocation /= selectedLocation)
                || (previousModel.selectedStartDate /= selectedStartDate)
    in
    case ( anyValuesUpdated, ( selectedLocation, selectedStartDate ) ) of
        ( True, ( Just location, Just startDate ) ) ->
            ( RemoteData.Requested
            , Cmd.batch
                [ RemoteData.scheduleLoadingStateTrigger (CheckIfTakingTooLong CalendarCheckResultRequest)
                , getCalendarCheckResult location startDate (getWeekEndDate startDate)
                , calendarCheckRequestSetStateInQueryString (parameterSelectionToQueryParamsString location startDate (getWeekEndDate startDate))
                ]
            )

        ( False, ( Just location, Just startDate ) ) ->
            -- No values were updated, but everything required is selected.
            -- We can get into this scenario when user navigates to a different tab
            -- within the application. In this case, we don't have to make another request for
            -- the calendar check and can reuse the previous results.
            -- The only action we need to do is to sync up the query string so that it matches
            -- the current state.
            ( previousModel.calendarCheckResult
            , calendarCheckRequestSetStateInQueryString (parameterSelectionToQueryParamsString location startDate (getWeekEndDate startDate))
            )

        _ ->
            -- In this case, we don't have enough info to make the request, so we don't
            -- do anything and remove the existing calendar check request results.
            ( RemoteData.NotRequested, Cmd.none )


update : Msg -> Model -> ( Model, Cmd Msg, Maybe OutMsg )
update msg model =
    case msg of
        StartDateChange value ->
            let
                updatedStartDate =
                    getUpdatedDate value

                ( nextCalendarCheckResultState, command ) =
                    attemptCalendarCheckRequest model model.selectedLocation updatedStartDate
            in
            ( { model | selectedStartDate = updatedStartDate, calendarCheckResult = nextCalendarCheckResultState }
            , command
            , Nothing
            )

        SelectedLocationChange updatedLocation ->
            let
                ( nextCalendarCheckResultState, command ) =
                    attemptCalendarCheckRequest model updatedLocation model.selectedStartDate
            in
            ( { model | selectedLocation = updatedLocation, calendarCheckResult = nextCalendarCheckResultState }
            , command
            , Nothing
            )

        RequestUpdateCalendarEvent calendarEvent ->
            ( model
            , Cmd.none
            , Just (RequestOpenNewBrowserTab calendarEvent.directCalendarEventLink)
            )

        ReceiveLocations (Err e) ->
            ( { model | locations = RemoteData.Error (RemoteData.errorFromHttpError e) }
            , Cmd.none
            , Nothing
            )

        ReceiveLocations (Ok locations) ->
            -- At this point, we have the locations, and may have a location selection saved from
            -- the query string.
            let
                selectedLocation =
                    model.initialSelection.locationId
                        |> Maybe.andThen (getLocationById locations)

                -- Because we could make a location selection based on the value from the query
                -- string, we will attempt to perform a calendar check request.
                ( nextCalendarCheckResultState, possibleCalendarCheckRequestCommand ) =
                    attemptCalendarCheckRequest model selectedLocation model.selectedStartDate

                updatedModel =
                    { model
                        | locations = RemoteData.Available locations
                        , selectedLocation = selectedLocation
                        , calendarCheckResult = nextCalendarCheckResultState
                    }
            in
            ( updatedModel
            , possibleCalendarCheckRequestCommand
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
    let
        -- Check if the initial selection was already made in the query string before
        -- rendering the required input message. This allows us to avoid flashing a
        -- message that asks for the input right before the ports communicate the pre-selected
        -- values to the model.
        shouldDisplayRequiredInputMessage { locationId, startDateTimestamp, endDateTimestamp } =
            case ( locationId, startDateTimestamp, endDateTimestamp ) of
                ( Just _, Just _, Just _ ) ->
                    False

                _ ->
                    True

        requiredInputMessage =
            case ( shouldDisplayRequiredInputMessage model.initialSelection, model.selectedLocation, model.selectedStartDate ) of
                ( True, Nothing, _ ) ->
                    Just "Select a location"

                ( True, Just _, Nothing ) ->
                    Just "Select a week"

                _ ->
                    Nothing

        viewDisplayedContent =
            case requiredInputMessage of
                Just message ->
                    viewPageMessage (PageMessage.RequiredInput message)

                Nothing ->
                    viewCalendarCheckResult model.appConfig model.calendarCheckResult
    in
    H.div []
        [ viewInputs model
        , viewDisplayedContent
        ]


invalidAppointmentReasonToString : InvalidAppointmentReason -> String
invalidAppointmentReasonToString reason =
    case reason of
        UnrecognizedTutorNameInAppointment (TutorName tutorName) ->
            "Unrecognized tutor name: " ++ tutorName


invalidScheduleReasonToString : InvalidScheduleReason -> String
invalidScheduleReasonToString reason =
    case reason of
        UnrecognizedTutorNamesInSchedule tutorNames ->
            let
                tutorNamesString =
                    tutorNames
                        |> List.map (\(TutorName name) -> name)
                        |> String.join ", "
            in
            "Unrecognized tutor names: " ++ tutorNamesString


calendarEventSummaryToString : CalendarEventSummary -> String
calendarEventSummaryToString (CalendarEventSummary summary) =
    summary


viewCalendarCheckResultContent : AppConfig -> CalendarCheckResult -> Html Msg
viewCalendarCheckResultContent appConfig { invalidAppointments, invalidSchedules, unrecognizedCalendarEvents } =
    let
        viewEmptySection =
            H.div [] []

        viewSectionWithTitle title children =
            H.div []
                (H.h2 [] [ H.text title ] :: children)

        viewSection title viewSingleItem maybeItemList =
            maybeItemList
                |> Maybe.map (List.map viewSingleItem)
                |> Maybe.map (viewSectionWithTitle title)
                |> Maybe.withDefault viewEmptySection

        viewInvalidAppointment value =
            DataTable.item
                [ DataTable.textField "Summary" (calendarEventSummaryToString value.calendarEvent.summary)
                , DataTable.textField "Time" (Date.toDisplayString appConfig.localTimezoneOffsetInMinutes value.calendarEvent.date)
                , DataTable.textField "Reason" (invalidAppointmentReasonToString value.reason)
                , DataTable.actionContainer
                    [ DataTable.actionLink "Update calendar event" (E.onClick <| RequestUpdateCalendarEvent value.calendarEvent)
                    ]
                ]

        viewInvalidSchedule value =
            DataTable.item
                [ DataTable.textField "Summary" (calendarEventSummaryToString value.calendarEvent.summary)
                , DataTable.textField "Time" (Date.toDisplayString appConfig.localTimezoneOffsetInMinutes value.calendarEvent.date)
                , DataTable.textField "Reason" (invalidScheduleReasonToString value.reason)
                , DataTable.actionContainer
                    [ DataTable.actionLink "Update calendar event" (E.onClick <| RequestUpdateCalendarEvent value.calendarEvent)
                    ]
                ]

        viewUnrecognizedCalendarEvent calendarEvent =
            DataTable.item
                [ DataTable.textField "Summary" (calendarEventSummaryToString calendarEvent.summary)
                , DataTable.textField "Time" (Date.toDisplayString appConfig.localTimezoneOffsetInMinutes calendarEvent.date)
                , DataTable.actionContainer
                    [ DataTable.actionLink "Update calendar event" (E.onClick <| RequestUpdateCalendarEvent calendarEvent)
                    ]
                ]

        viewInvalidAppointmentsSection =
            viewSection "Invalid Appointments" viewInvalidAppointment invalidAppointments

        viewInvalidSchedulesSection =
            viewSection "Invalid Schedules" viewInvalidSchedule invalidSchedules

        viewUnrecognizedCalendarEventsSection =
            viewSection "Unrecognized Calendar Events" viewUnrecognizedCalendarEvent unrecognizedCalendarEvents
    in
    case ( invalidAppointments, invalidSchedules, unrecognizedCalendarEvents ) of
        ( Nothing, Nothing, Nothing ) ->
            H.div [] [ viewPageMessage PageMessage.NoItemsAvailable ]

        _ ->
            H.div []
                [ viewInvalidSchedulesSection
                , viewInvalidAppointmentsSection
                , viewUnrecognizedCalendarEventsSection
                ]


viewCalendarCheckResult : AppConfig -> RemoteData CalendarCheckResult -> Html Msg
viewCalendarCheckResult appConfig calendarCheckResultRemoteData =
    let
        viewContent =
            case calendarCheckResultRemoteData of
                RemoteData.NotRequested ->
                    H.div [] []

                RemoteData.Requested ->
                    H.div [] []

                RemoteData.StillLoading ->
                    spinner

                RemoteData.Error err ->
                    viewPageMessage (PageMessage.Error err)

                RemoteData.Available calendarCheckResult ->
                    viewCalendarCheckResultContent appConfig calendarCheckResult
    in
    H.div [ Styles.apply [ Styles.calendarCheck.contentContainer ] ] [ viewContent ]


noValueOption : Input.SelectOption
noValueOption =
    Input.toSelectOption { label = "", value = "" }


viewWeekPicker : String -> TimezoneOffset -> String -> Maybe Date -> Html msg
viewWeekPicker elementId timezoneOffset label maybeValue =
    let
        getWeekRangeDisplayString weekStartDate =
            Date.toCompactDateDisplayString timezoneOffset weekStartDate
                ++ " - "
                ++ Date.toCompactDateDisplayString timezoneOffset (getWeekEndDate weekStartDate)

        dateString =
            maybeValue
                |> Maybe.map getWeekRangeDisplayString
                |> Maybe.withDefault ""
    in
    H.div [ Styles.apply [ Styles.field.self ] ]
        [ H.label [ Styles.apply [ Styles.field.label ] ] [ H.text label ]
        , H.input
            [ Styles.apply [ Styles.field.input ]
            , A.id elementId
            , A.value dateString
            , A.readonly True
            ]
            []
        ]


viewInputs : Model -> Html Msg
viewInputs model =
    let
        { selectedLocation, locations, appConfig, selectedStartDate } =
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
        , viewWeekPicker weekPickerInputElementId appConfig.localTimezoneOffsetInMinutes "Week" selectedStartDate
        ]


getLocationById : List Location -> Int -> Maybe Location
getLocationById locations id =
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
    in
    find locations .id id


decodeLocationFromRawLocationId : List Location -> String -> Json.Decoder (Maybe Location)
decodeLocationFromRawLocationId locations rawLocationId =
    let
        maybeLocationId =
            String.toInt rawLocationId
    in
    maybeLocationId
        |> Maybe.andThen (getLocationById locations)
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
    let
        wrapListWithMaybe list =
            case list of
                [] ->
                    Nothing

                _ ->
                    Just list

        decodeCalendarEvent =
            Json.map3
                CalendarEvent
                (Json.field "directCalendarEventLink" Json.string |> Json.map Url.fromString)
                (Json.field "timestamp" Json.int |> Json.andThen Date.decodeTimestamp)
                (Json.field "calendarEventSummary" Json.string |> Json.map CalendarEventSummary)

        decodeTutorName =
            Json.string |> Json.map TutorName

        decodeInvalidAppointmentReason =
            Json.map
                UnrecognizedTutorNameInAppointment
                (Json.field "invalidTutorName" decodeTutorName)

        decodeInvalidScheduleReason =
            Json.map
                UnrecognizedTutorNamesInSchedule
                (Json.field "invalidTutorNames" (Json.list decodeTutorName))

        decodeInvalidAppointment =
            Json.map2
                InvalidAppointmentEntry
                decodeCalendarEvent
                decodeInvalidAppointmentReason

        decodeInvalidSchedule =
            Json.map2
                InvalidScheduleEntry
                decodeCalendarEvent
                decodeInvalidScheduleReason
    in
    Json.map3
        CalendarCheckResult
        (Json.field "invalidAppointments" (decodeInvalidAppointment |> Json.list |> Json.map wrapListWithMaybe))
        (Json.field "invalidSchedules" (decodeInvalidSchedule |> Json.list |> Json.map wrapListWithMaybe))
        (Json.field "unrecognizedCalendarEvents" (decodeCalendarEvent |> Json.list |> Json.map wrapListWithMaybe))


parameterSelectionToQueryParamsString : Location -> Date -> Date -> String
parameterSelectionToQueryParamsString location startDate endDate =
    let
        queryParams =
            [ ( "locationId", String.fromInt location.id )
            , ( "startDate", startDate |> Date.dateToTimestamp |> String.fromInt )
            , ( "endDate", endDate |> Date.dateToTimestamp |> String.fromInt )
            ]
    in
    queryParams
        |> List.map (\( key, value ) -> key ++ "=" ++ value)
        |> String.join "&"


getCalendarCheckResult : Location -> Date -> Date -> Cmd Msg
getCalendarCheckResult location startDate endDate =
    let
        url =
            "/api/admin/calendar/check" ++ "?" ++ parameterSelectionToQueryParamsString location startDate endDate
    in
    Http.send
        ReceiveCalendarCheckResult
        (Http.get url decodeCalendarCheckResult)



-- SUBSCRIPTIONS


datePickerDateSelectionToCmd : { id : String, timestamp : Int } -> Msg
datePickerDateSelectionToCmd { id, timestamp } =
    case id of
        "calendar-check-week-picker" ->
            StartDateChange (DatePickerDateValue <| String.fromInt timestamp)

        _ ->
            NoOp


subscriptions : Sub Msg
subscriptions =
    Sub.batch
        [ onDatePickerDateSelection datePickerDateSelectionToCmd ]



-- PORTS


port calendarCheckInitializeWeekPicker :
    { pickerInputId : String
    , selectedStartWeekMondayTimestamp : Maybe Int
    }
    -> Cmd msg


port calendarCheckCleanupWeekPicker : { pickerInputId : String } -> Cmd msg


port calendarCheckRequestSetStateInQueryString : String -> Cmd msg


port onDatePickerDateSelection : ({ id : String, timestamp : Int } -> msg) -> Sub msg
