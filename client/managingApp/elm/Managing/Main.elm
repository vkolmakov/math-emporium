port module Managing.Main exposing (main)

import Browser
import Browser.Dom as Dom
import Browser.Navigation as Navigation
import Html as H exposing (Attribute, Html)
import Html.Attributes as A
import Html.Lazy exposing (lazy, lazy2)
import Managing.AppConfig as AppConfig exposing (AppConfig)
import Managing.Appointments.Page.AppointmentList as AppointmentList
import Managing.CalendarCheck.Page.CalendarCheck as CalendarCheck
import Managing.ErrorEvents.Page.ErrorEventList as ErrorEventList
import Managing.Events.Page.EventList as EventList
import Managing.Route as Route exposing (Route)
import Managing.Settings.Page.EditSettings as EditSettings
import Managing.Styles as Styles
import Managing.Users.Page.UserDetail as UserDetail
import Managing.Users.Page.UserList as UserList
import Managing.Utils.RemoteData as RemoteData
import Managing.Utils.Url as Url exposing (Url)
import Managing.View.Modal as Modal
import Process
import Task


main =
    Browser.element
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }



-- MODEL


type alias InitFlags =
    { initialHref : String
    , localTimezoneOffsetInMinutes : Int
    }


type alias Model =
    { route : Route
    , appConfig : AppConfig
    , userListPageModel : UserList.Model
    , userDetailPageModel : UserDetail.Model
    , eventListPageModel : EventList.Model
    , errorEventListPageModel : ErrorEventList.Model
    , editSettingsPageModel : EditSettings.Model
    , appointmentListPageModel : AppointmentList.Model
    , calendarCheckPageModel : CalendarCheck.Model
    }


init : InitFlags -> ( Model, Cmd Msg )
init flags =
    let
        route =
            Route.fromLocationHref flags.initialHref

        appConfig =
            AppConfig.create flags.localTimezoneOffsetInMinutes

        initialModel =
            Model
                route
                appConfig
                (UserList.init appConfig)
                (UserDetail.init appConfig)
                (EventList.init appConfig)
                (ErrorEventList.init appConfig)
                (EditSettings.init appConfig)
                (AppointmentList.init appConfig)
                (CalendarCheck.init appConfig)

        ( initialModelBasedOnRoute, initialCmdBasedOnRoute ) =
            getInitModelCmd route initialModel
    in
    ( initialModelBasedOnRoute
    , initialCmdBasedOnRoute
      -- For initialization, passed route is the same as one on the model.
    )



-- UPDATE


type Msg
    = LocationHrefChange LocationChangeInfo
    | RequestLocationHrefChange String
    | UserListPageMsg UserList.Msg
    | UserDetailPageMsg UserDetail.Msg
    | EventListPageMsg EventList.Msg
    | ErrorEventListPageMsg ErrorEventList.Msg
    | EditSettingsPageMsg EditSettings.Msg
    | AppointmentListPageMsg AppointmentList.Msg
    | CalendarCheckPageMsg CalendarCheck.Msg
    | ScrollPositionRestorationFailure Int { x : Float, y : Float }
    | AttemptRestoreScrollPosition Int { x : Float, y : Float }
    | NoOp


type OutMsg
    = UserDetailOutMsg (Maybe UserDetail.OutMsg)
    | UserListPageOutMsg (Maybe UserList.OutMsg)
    | EventListPageOutMsg (Maybe EventList.OutMsg)
    | ErrorEventListPageOutMsg (Maybe ErrorEventList.OutMsg)
    | EditSettingsPageOutMsg (Maybe EditSettings.OutMsg)
    | AppointmentListPageOutMsg (Maybe AppointmentList.OutMsg)
    | CalendarCheckPageOutMsg (Maybe CalendarCheck.OutMsg)


handleOutMsg : Model -> OutMsg -> ( Model, Cmd msg )
handleOutMsg model outMsg =
    case outMsg of
        UserDetailOutMsg (Just UserDetail.RequestUserListDataRefresh) ->
            ( { model | userListPageModel = UserList.init model.appConfig }, Cmd.none )

        UserDetailOutMsg Nothing ->
            ( model, Cmd.none )

        UserListPageOutMsg (Just (UserList.RequestNavigationTo requestedRoute)) ->
            ( model, pushLocationHrefChange (Route.toHref requestedRoute) )

        UserListPageOutMsg Nothing ->
            ( model, Cmd.none )

        EventListPageOutMsg (Just (EventList.RequestShowModal modal)) ->
            ( model, requestShowModal (Modal.getModalElementId modal) )

        EventListPageOutMsg (Just (EventList.RequestCloseModal modal)) ->
            ( model, requestCloseModal (Modal.getModalElementId modal) )

        EventListPageOutMsg Nothing ->
            ( model, Cmd.none )

        ErrorEventListPageOutMsg (Just ErrorEventList.NoOutMsg) ->
            ( model, Cmd.none )

        ErrorEventListPageOutMsg Nothing ->
            ( model, Cmd.none )

        EditSettingsPageOutMsg (Just EditSettings.NoOpOutMsg) ->
            ( model, Cmd.none )

        EditSettingsPageOutMsg Nothing ->
            ( model, Cmd.none )

        AppointmentListPageOutMsg (Just (AppointmentList.RequestShowModal modal)) ->
            ( model, requestShowModal (Modal.getModalElementId modal) )

        AppointmentListPageOutMsg (Just (AppointmentList.RequestCloseModal modal)) ->
            ( model, requestCloseModal (Modal.getModalElementId modal) )

        AppointmentListPageOutMsg Nothing ->
            ( model, Cmd.none )

        CalendarCheckPageOutMsg (Just (CalendarCheck.RequestOpenNewBrowserTab url)) ->
            ( model, requestOpenNewBrowserTab (Url.toString url) )

        CalendarCheckPageOutMsg Nothing ->
            ( model, Cmd.none )


scrollRestorationConfig =
    { maxAttempts = 20
    , delayBetweenAttempts = 200
    }


attemptRestoreScrollPosition : Int -> { x : Float, y : Float } -> Cmd Msg
attemptRestoreScrollPosition attemptNum scrollPosition =
    let
        attemptScroll result =
            case result of
                Ok _ ->
                    NoOp

                Err _ ->
                    ScrollPositionRestorationFailure (attemptNum + 1) scrollPosition

        trySetViewport scene { x, y } =
            if x <= scene.width && y <= scene.height then
                Dom.setViewport x y

            else
                Task.fail "Cannot scroll - out of bounds"
    in
    if attemptNum > scrollRestorationConfig.maxAttempts then
        Cmd.none

    else
        Dom.getViewport
            |> Task.andThen (\{ scene } -> trySetViewport scene scrollPosition)
            |> Task.attempt attemptScroll


update : Msg -> Model -> ( Model, Cmd Msg )
update message model =
    case message of
        RequestLocationHrefChange requestedLocationHref ->
            ( model, pushLocationHrefChange requestedLocationHref )

        LocationHrefChange { href, scrollPosition } ->
            let
                newRoute =
                    Route.fromLocationHref href

                ( updatedModelBasedOnRoute, initCmdBasedOnRoute ) =
                    getInitModelCmd newRoute model

                scrollPositionRestorationCmd =
                    case scrollPosition of
                        Just sp ->
                            attemptRestoreScrollPosition 1 sp

                        Nothing ->
                            Cmd.none
            in
            ( { updatedModelBasedOnRoute | route = newRoute }, Cmd.batch [ scrollPositionRestorationCmd, initCmdBasedOnRoute ] )

        UserListPageMsg msg ->
            let
                ( innerModel, innerCmd, outMsg ) =
                    UserList.update msg model.userListPageModel

                ( updatedModelAfterOutMsg, cmdRequestedByOutMsg ) =
                    handleOutMsg model (UserListPageOutMsg outMsg)
            in
            ( { updatedModelAfterOutMsg | userListPageModel = innerModel }
            , Cmd.batch [ cmdRequestedByOutMsg, Cmd.map UserListPageMsg innerCmd ]
            )

        UserDetailPageMsg msg ->
            let
                ( innerModel, innerCmd, outMsg ) =
                    UserDetail.update msg model.userDetailPageModel

                ( updatedModelAfterOutMsg, cmdRequestedByOutMsg ) =
                    handleOutMsg model (UserDetailOutMsg outMsg)
            in
            ( { updatedModelAfterOutMsg | userDetailPageModel = innerModel }
            , Cmd.batch [ cmdRequestedByOutMsg, Cmd.map UserDetailPageMsg innerCmd ]
            )

        EventListPageMsg msg ->
            let
                ( innerModel, innerCmd, outMsg ) =
                    EventList.update msg model.eventListPageModel

                ( updatedModelAfterOutMsg, cmdRequestedByOutMsg ) =
                    handleOutMsg model (EventListPageOutMsg outMsg)
            in
            ( { updatedModelAfterOutMsg | eventListPageModel = innerModel }
            , Cmd.batch [ cmdRequestedByOutMsg, Cmd.map EventListPageMsg innerCmd ]
            )

        ErrorEventListPageMsg msg ->
            let
                ( innerModel, innerCmd, outMsg ) =
                    ErrorEventList.update msg model.errorEventListPageModel

                ( updatedModelAfterOutMsg, cmdRequestedByOutMsg ) =
                    handleOutMsg model (ErrorEventListPageOutMsg outMsg)
            in
            ( { updatedModelAfterOutMsg | errorEventListPageModel = innerModel }
            , Cmd.batch [ cmdRequestedByOutMsg, Cmd.map ErrorEventListPageMsg innerCmd ]
            )

        EditSettingsPageMsg msg ->
            let
                ( innerModel, innerCmd, outMsg ) =
                    EditSettings.update msg model.editSettingsPageModel

                ( updatedModelAfterOutMsg, cmdRequestedByOutMsg ) =
                    handleOutMsg model (EditSettingsPageOutMsg outMsg)
            in
            ( { updatedModelAfterOutMsg | editSettingsPageModel = innerModel }
            , Cmd.batch [ cmdRequestedByOutMsg, Cmd.map EditSettingsPageMsg innerCmd ]
            )

        AppointmentListPageMsg msg ->
            let
                ( innerModel, innerCmd, outMsg ) =
                    AppointmentList.update msg model.appointmentListPageModel

                ( updatedModelAfterOutMsg, cmdRequestedByOutMsg ) =
                    handleOutMsg model (AppointmentListPageOutMsg outMsg)
            in
            ( { updatedModelAfterOutMsg | appointmentListPageModel = innerModel }
            , Cmd.batch [ cmdRequestedByOutMsg, Cmd.map AppointmentListPageMsg innerCmd ]
            )

        CalendarCheckPageMsg msg ->
            let
                ( innerModel, innerCmd, outMsg ) =
                    CalendarCheck.update msg model.calendarCheckPageModel

                ( updatedModelAfterOutMsg, cmdRequestedByOutMsg ) =
                    handleOutMsg model (CalendarCheckPageOutMsg outMsg)
            in
            ( { updatedModelAfterOutMsg | calendarCheckPageModel = innerModel }
            , Cmd.batch [ cmdRequestedByOutMsg, Cmd.map CalendarCheckPageMsg innerCmd ]
            )

        {- Scroll restoration flow:
           * LocationHrefChange makes the first attempt to restore the scroll
           * attemptRestoreScrollPosition will get the current scene size and check
             if requested position is reachable, and if it is, it scrolls to it and stops.
             If not, a ScrollRestorationFailure message is dispatched.
           * attemptRestoreScrollPosition is also the only place where attemptNum is updated
             and checked. If we reach the maximum number of attempts, we give up.
           * ScrollPositionRestorationFailure picks up a failed task from attemptRestoreScrollPosition
             and schedules an AttemptRestoreScrollPosition, which goes through attemptRestoreScrollPosition.
        -}
        AttemptRestoreScrollPosition attemptNum scrollPosition ->
            ( model, attemptRestoreScrollPosition attemptNum scrollPosition )

        ScrollPositionRestorationFailure attemptNum scrollPosition ->
            ( model
            , Process.sleep scrollRestorationConfig.delayBetweenAttempts
                |> Task.perform (\_ -> AttemptRestoreScrollPosition attemptNum scrollPosition)
            )

        NoOp ->
            ( model, Cmd.none )


{-| Returns a command for a NEW route with the PREVIOUS model.
This is useful for determining whether or not the data has to
be refreshed when navigating to a new route.
-}
getInitModelCmd : Route -> Model -> ( Model, Cmd Msg )
getInitModelCmd route model =
    case route of
        Route.Home ->
            ( model, Cmd.none )

        Route.UserList ->
            ( model, Cmd.map UserListPageMsg (UserList.initCmd model.userListPageModel) )

        Route.UserDetail userId ->
            {- Ensure that we start with a clear model because
               we want to avoid seeing old content if we end up
               navigating to that route more than once.
            -}
            ( { model | userDetailPageModel = UserDetail.init model.appConfig }
            , Cmd.map UserDetailPageMsg (UserDetail.initCmd userId)
            )

        Route.EventList ->
            ( model, Cmd.map EventListPageMsg (EventList.initCmd model.eventListPageModel) )

        Route.ErrorEventList ->
            ( model, Cmd.map ErrorEventListPageMsg (ErrorEventList.initCmd model.errorEventListPageModel) )

        Route.EditSettings ->
            {- Ensure that settings are always up-to-date. -}
            ( { model | editSettingsPageModel = EditSettings.init model.appConfig }
            , Cmd.map EditSettingsPageMsg (EditSettings.initCmd model.editSettingsPageModel)
            )

        Route.AppointmentList ->
            ( model, Cmd.map AppointmentListPageMsg (AppointmentList.initCmd model.appointmentListPageModel) )

        Route.CalendarCheck queryParams ->
            let
                basePageModel =
                    case ( queryParams.locationId, queryParams.startDateTimestamp, queryParams.endDateTimestamp ) of
                        ( Nothing, Nothing, Nothing ) ->
                            -- If nothing is present in the query string -> use the pre-existing model
                            -- This case will happen when user stays within the app and navigates away to
                            -- a different tab.
                            model.calendarCheckPageModel

                        _ ->
                            -- If anything is present in the query string -> kill the existing model.
                            -- and use the values from the query string. This happens when page was refreshed
                            -- or a link was followed directly. (initial load)
                            CalendarCheck.init model.appConfig

                updatedPageModel =
                    { basePageModel | initialSelection = queryParams }
            in
            ( { model | calendarCheckPageModel = updatedPageModel }
            , Cmd.map CalendarCheckPageMsg (CalendarCheck.initCmd updatedPageModel)
            )

        Route.Unknown ->
            ( model, Navigation.load "/" )



-- VIEW


activeNavItems : List NavItem
activeNavItems =
    [ NavItem Route.UserList "Users"
    , NavItem Route.EventList "Events"
    , NavItem Route.ErrorEventList "Errors"
    , NavItem Route.EditSettings "Settings"
    , NavItem Route.AppointmentList "Appointments"
    , NavItem (Route.CalendarCheck { locationId = Nothing, startDateTimestamp = Nothing, endDateTimestamp = Nothing }) "Calendar Check"
    ]


getHighlightedRoute : Route -> Maybe Route
getHighlightedRoute route =
    case route of
        Route.UserList ->
            Just Route.UserList

        Route.UserDetail _ ->
            Just Route.UserList

        Route.Home ->
            Nothing

        Route.EventList ->
            Just Route.EventList

        Route.ErrorEventList ->
            Just Route.ErrorEventList

        Route.EditSettings ->
            Just Route.EditSettings

        Route.AppointmentList ->
            Just Route.AppointmentList

        Route.CalendarCheck _ ->
            Just (Route.CalendarCheck { locationId = Nothing, startDateTimestamp = Nothing, endDateTimestamp = Nothing })

        Route.Unknown ->
            Nothing


view model =
    H.div [ Styles.apply [ Styles.applicationContainer.self ] ]
        [ lazy2 viewSectionNav activeNavItems (getHighlightedRoute model.route)
        , lazy viewPageContent model
        ]


viewPageContent : Model -> Html Msg
viewPageContent model =
    let
        pageView =
            case model.route of
                Route.Home ->
                    viewHomePage

                Route.UserList ->
                    H.map UserListPageMsg <| UserList.view model.userListPageModel

                Route.UserDetail id ->
                    H.map UserDetailPageMsg <| UserDetail.view model.userDetailPageModel

                Route.EventList ->
                    H.map EventListPageMsg <| EventList.view model.eventListPageModel

                Route.ErrorEventList ->
                    H.map ErrorEventListPageMsg <| ErrorEventList.view model.errorEventListPageModel

                Route.EditSettings ->
                    H.map EditSettingsPageMsg <| EditSettings.view model.editSettingsPageModel

                Route.AppointmentList ->
                    H.map AppointmentListPageMsg <| AppointmentList.view model.appointmentListPageModel

                Route.CalendarCheck _ ->
                    H.map CalendarCheckPageMsg <| CalendarCheck.view model.calendarCheckPageModel

                Route.Unknown ->
                    H.text "At unknown route"
    in
    H.div [ Styles.apply [ Styles.applicationContainer.pageContent ] ] [ pageView ]


viewHomePage =
    H.h2 [ Styles.apply [ Styles.home.message ] ] [ H.text "Select an option" ]



-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.batch
        [ onLocationHrefChange LocationHrefChange
        , Sub.map CalendarCheckPageMsg CalendarCheck.subscriptions
        ]



-- MODAL


port requestShowModal : String -> Cmd msg


port requestCloseModal : String -> Cmd msg


port onModalCloseRequest : (String -> msg) -> Sub msg



-- BROWSER


port requestOpenNewBrowserTab : String -> Cmd msg



-- NAVIGATION


type alias LocationChangeInfo =
    { href : String
    , scrollPosition : Maybe { x : Float, y : Float }
    }


port onLocationHrefChange : (LocationChangeInfo -> msg) -> Sub msg


port pushLocationHrefChange : String -> Cmd msg


type alias NavItem =
    { route : Route
    , label : String
    }


getLinkStyles : Maybe Route -> NavItem -> Attribute msg
getLinkStyles highlightedRoute navItem =
    case highlightedRoute of
        Just r ->
            if r == navItem.route then
                Styles.apply [ Styles.sectionNav.link, Styles.sectionNav.linkHighlighted ]

            else
                Styles.apply [ Styles.sectionNav.link ]

        Nothing ->
            Styles.apply [ Styles.sectionNav.link ]


navItemToLink : Maybe Route -> NavItem -> Html Msg
navItemToLink highlightedRoute navItem =
    let
        baseLinkAttributes =
            [ -- required to allow safely adjust font weight on hover/focus
              A.attribute "data-text" navItem.label
            ]

        linkStyles =
            getLinkStyles highlightedRoute navItem
    in
    Route.link
        (RequestLocationHrefChange (Route.toHref navItem.route))
        navItem.route
        (linkStyles :: baseLinkAttributes)
        [ H.text navItem.label ]


viewSectionNav : List NavItem -> Maybe Route -> Html Msg
viewSectionNav navItems highlightedRoute =
    let
        links =
            navItems
                |> List.map (navItemToLink highlightedRoute)

        listItems =
            links
                |> List.map (\link -> H.li [ Styles.apply [ Styles.sectionNav.item ] ] [ link ])
    in
    H.ul [ Styles.apply [ Styles.sectionNav.self ] ] listItems
