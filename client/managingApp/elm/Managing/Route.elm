module Managing.Route exposing
    ( CalendarCheckRouteInitialStateQueryParams
    , Route(..)
    , fromLocationHref
    , href
    , link
    , toHref
    )

import Html as H exposing (Attribute, Html)
import Html.Attributes as A
import Html.Events as E
import Json.Decode as Json
import Url exposing (Url)
import Url.Parser as UrlParser exposing ((</>), (<?>), Parser, s)
import Url.Parser.Query as Query


type alias CalendarCheckRouteInitialStateQueryParams =
    { locationId : Maybe Int
    , startDateTimestamp : Maybe Int
    , endDateTimestamp : Maybe Int
    }


type Route
    = Home
    | UserList
    | UserDetail Int
    | EventList
    | ErrorEventList
    | EditSettings
    | AppointmentList
    | CalendarCheck CalendarCheckRouteInitialStateQueryParams
    | Unknown


fromLocationHref : String -> Route
fromLocationHref locationHref =
    let
        routeParser =
            UrlParser.oneOf
                [ UrlParser.map Home (s "manage-portal")
                , UrlParser.map UserList (s "manage-portal" </> s "users")
                , UrlParser.map UserDetail (s "manage-portal" </> s "users" </> UrlParser.int)
                , UrlParser.map EventList (s "manage-portal" </> s "events")
                , UrlParser.map ErrorEventList (s "manage-portal" </> s "errors")
                , UrlParser.map EditSettings (s "manage-portal" </> s "settings")
                , UrlParser.map AppointmentList (s "manage-portal" </> s "appointments")
                , UrlParser.map CalendarCheck
                    (s "manage-portal"
                        </> s "calendar-check"
                        <?> Query.map3 CalendarCheckRouteInitialStateQueryParams
                                (Query.int "locationId")
                                (Query.int "startDate")
                                (Query.int "endDate")
                    )
                ]

        correspondingRoute =
            locationHref
                |> Url.fromString
                |> Maybe.andThen (UrlParser.parse routeParser)
                |> Maybe.withDefault Unknown
    in
    correspondingRoute


toHref : Route -> String
toHref r =
    let
        path =
            case r of
                Home ->
                    ""

                UserList ->
                    "users"

                UserDetail id ->
                    "users/" ++ String.fromInt id

                EventList ->
                    "events"

                ErrorEventList ->
                    "errors"

                EditSettings ->
                    "settings"

                AppointmentList ->
                    "appointments"

                CalendarCheck _ ->
                    "calendar-check"

                Unknown ->
                    ""
    in
    "/manage-portal/" ++ path


href route =
    A.href (toHref route)


link msg r attrs children =
    H.a (E.preventDefaultOn "click" (Json.succeed ( msg, True )) :: href r :: attrs) children
