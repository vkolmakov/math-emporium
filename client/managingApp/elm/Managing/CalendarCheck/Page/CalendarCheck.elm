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
    | RequestUpdateCalendarEvent CalendarEvent
    | ReceiveLocations (Result Http.Error (List Location))
    | ReceiveCalendarCheckResult (Result Http.Error CalendarCheckResult)
    | CheckIfTakingTooLong RemoteDataRequest
    | Retry RemoteDataRequest
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


attemptCalendarCheckRequest : Maybe Location -> Maybe Date -> Maybe Date -> ( RemoteData CalendarCheckResult, Cmd Msg )
attemptCalendarCheckRequest selectedLocation selectedStartDate selectedEndDate =
    case ( selectedLocation, selectedStartDate, selectedEndDate ) of
        ( Just location, Just startDate, Just endDate ) ->
            ( RemoteData.Requested
            , Cmd.batch
                [ RemoteData.scheduleLoadingStateTrigger (CheckIfTakingTooLong CalendarCheckResultRequest)
                , getCalendarCheckResult location startDate endDate
                ]
            )

        _ ->
            ( RemoteData.NotRequested, Cmd.none )


update : Msg -> Model -> ( Model, Cmd Msg, Maybe OutMsg )
update msg model =
    case msg of
        StartDateChange value ->
            let
                updatedStartDate =
                    getUpdatedDate value

                ( nextCalendarCheckResultState, command ) =
                    attemptCalendarCheckRequest model.selectedLocation updatedStartDate model.selectedEndDate
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
                    attemptCalendarCheckRequest model.selectedLocation model.selectedStartDate updatedEndDate
            in
            ( { model | selectedEndDate = updatedEndDate, calendarCheckResult = nextCalendarCheckResultState }
            , command
            , Nothing
            )

        SelectedLocationChange updatedLocation ->
            let
                ( nextCalendarCheckResultState, command ) =
                    attemptCalendarCheckRequest updatedLocation model.selectedStartDate model.selectedEndDate
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

        Retry _ ->
            -- TODO: implement
            ( model, Cmd.none, Nothing )

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
        [ viewInvalidAppointmentsSection
        , viewInvalidSchedulesSection
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
                    viewPageError (Retry CalendarCheckResultRequest) err

                RemoteData.Available calendarCheckResult ->
                    viewCalendarCheckResultContent appConfig calendarCheckResult
    in
    H.div [] [ viewContent ]


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
