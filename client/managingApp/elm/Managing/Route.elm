module Managing.Route exposing (Route(..), fromLocationHref, href, link, toHref)

import Html as H exposing (Attribute, Html)
import Html.Attributes as A
import Html.Events as E
import Json.Decode as Json
import Url exposing (Url)
import Url.Parser as UrlParser exposing ((</>), Parser, s)


type Route
    = Home
    | UserList
    | UserDetail Int
    | EventList
    | ErrorEventList
    | EditSettings
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

                Unknown ->
                    ""
    in
    "/manage-portal/" ++ path


href route =
    A.href (toHref route)


link msg r attrs children =
    H.a (E.preventDefaultOn "click" (Json.succeed ( msg, True )) :: href r :: attrs) children
