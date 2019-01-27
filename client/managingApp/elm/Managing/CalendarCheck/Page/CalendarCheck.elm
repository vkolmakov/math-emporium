port module Managing.CalendarCheck.Page.CalendarCheck exposing
    ( Model
    , Msg
    , OutMsg(..)
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
    , selectedEndDate : Maybe Date
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
    | EndDateChange DatePickerDateValue
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

        endDateSelection =
            -- Prioritize values coming from the model.
            -- If none, check if something was supplied from the query string.
            case model.selectedEndDate of
                Just _ ->
                    model.selectedEndDate |> Maybe.map Date.dateToTimestamp

                Nothing ->
                    model.initialSelection.endDateTimestamp

        initializeDatePickers =
            calendarCheckInitializeDatePickers
                -- Note that values have to be sent for cases when some values were selected, but user navigated
                -- away from the tab. Values are still alive on the model, but date picker element does not
                -- remember them.
                { startDatePickerId = "calendar-check-start-date"
                , selectedStartDateTimestamp = startDateSelection
                , endDatePickerId = "calendar-check-end-date"
                , selectedEndDateTimestamp = endDateSelection
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


getUpdatedDate : DatePickerDateValue -> Maybe Date
getUpdatedDate (DatePickerDateValue dateString) =
    String.toInt dateString
        |> Maybe.map Date.timestampToDate


attemptCalendarCheckRequest : Model -> Maybe Location -> Maybe Date -> Maybe Date -> ( RemoteData CalendarCheckResult, Cmd Msg )
attemptCalendarCheckRequest previousModel selectedLocation selectedStartDate selectedEndDate =
    let
        anyValuesUpdated =
            (previousModel.selectedLocation /= selectedLocation)
                || (previousModel.selectedStartDate /= selectedStartDate)
                || (previousModel.selectedEndDate /= selectedEndDate)
    in
    case ( anyValuesUpdated, ( selectedLocation, selectedStartDate, selectedEndDate ) ) of
        ( True, ( Just location, Just startDate, Just endDate ) ) ->
            ( RemoteData.Requested
            , Cmd.batch
                [ RemoteData.scheduleLoadingStateTrigger (CheckIfTakingTooLong CalendarCheckResultRequest)
                , getCalendarCheckResult location startDate endDate
                , calendarCheckRequestSetStateInQueryString (parameterSelectionToQueryParamsString location startDate endDate)
                ]
            )

        ( False, ( Just location, Just startDate, Just endDate ) ) ->
            -- No values were updated, but everything required is selected.
            -- We can get into this scenario when user navigates to a different tab
            -- within the application. In this case, we don't have to make another request for
            -- the calendar check and can reuse the previous results.
            -- The only action we need to do is to sync up the query string so that it matches
            -- the current state.
            ( previousModel.calendarCheckResult
            , calendarCheckRequestSetStateInQueryString (parameterSelectionToQueryParamsString location startDate endDate)
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
                    attemptCalendarCheckRequest model model.selectedLocation updatedStartDate model.selectedEndDate
            in
            ( { model | selectedStartDate = updatedStartDate, calendarCheckResult = nextCalendarCheckResultState }
            , command
            , Nothing
            )

        EndDateChange value ->
            let
                updatedEndDate =
                    getUpdatedDate value

                ( nextCalendarCheckResultState, command ) =
                    attemptCalendarCheckRequest model model.selectedLocation model.selectedStartDate updatedEndDate
            in
            ( { model | selectedEndDate = updatedEndDate, calendarCheckResult = nextCalendarCheckResultState }
            , command
            , Nothing
            )

        SelectedLocationChange updatedLocation ->
            let
                ( nextCalendarCheckResultState, command ) =
                    attemptCalendarCheckRequest model updatedLocation model.selectedStartDate model.selectedEndDate
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
                    attemptCalendarCheckRequest model selectedLocation model.selectedStartDate model.selectedEndDate

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
    H.div []
        [ viewInputs model
        , viewCalendarCheckResult model.appConfig model.calendarCheckResult
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


viewDatePicker : String -> TimezoneOffset -> String -> Maybe Date -> (String -> msg) -> Html msg
viewDatePicker elementId timezoneOffset label maybeValue onChangeMsg =
    let
        dateString =
            maybeValue
                |> Maybe.map (Date.toCompactDateDisplayString timezoneOffset)
                |> Maybe.withDefault ""
    in
    H.div [ Styles.apply [ Styles.field.self ] ]
        [ H.label [ Styles.apply [ Styles.field.label ] ] [ H.text label ]
        , H.input
            [ Styles.apply [ Styles.field.input ]
            , A.id elementId
            , A.value dateString
            , E.onInput onChangeMsg
            , A.readonly True
            ]
            []
        ]


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
        , viewDatePicker "calendar-check-start-date" appConfig.localTimezoneOffsetInMinutes "Start Date" selectedStartDate (StartDateChange << DatePickerDateValue)
        , viewDatePicker "calendar-check-end-date" appConfig.localTimezoneOffsetInMinutes "End Date" selectedEndDate (EndDateChange << DatePickerDateValue)
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
        "calendar-check-start-date" ->
            StartDateChange (DatePickerDateValue <| String.fromInt timestamp)

        "calendar-check-end-date" ->
            EndDateChange (DatePickerDateValue <| String.fromInt timestamp)

        _ ->
            NoOp


subscriptions : Sub Msg
subscriptions =
    Sub.batch
        [ onDatePickerDateSelection datePickerDateSelectionToCmd ]



-- PORTS


port calendarCheckInitializeDatePickers :
    { startDatePickerId : String
    , selectedStartDateTimestamp : Maybe Int
    , endDatePickerId : String
    , selectedEndDateTimestamp : Maybe Int
    }
    -> Cmd msg


port calendarCheckRequestSetStateInQueryString : String -> Cmd msg


port onDatePickerDateSelection : ({ id : String, timestamp : Int } -> msg) -> Sub msg
