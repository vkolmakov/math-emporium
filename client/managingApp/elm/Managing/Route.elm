module Managing.Route exposing (Route(..), fromLocationHref, href, link, toHref)

import Html.Styled as H exposing (Attribute, Html)
import Html.Styled.Attributes as A
import Html.Styled.Events as E
import Json.Decode as Json
import Url exposing (Url)
import Url.Parser as UrlParser exposing ((</>), Parser, s)


type Route
    = Home
    | UserList
    | UserDetail Int
    | EventList
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

                Unknown ->
                    ""
    in
    "/manage-portal/" ++ path


href route =
    A.href (toHref route)


link msg r attrs children =
    H.a (E.preventDefaultOn "click" (Json.succeed ( msg, True )) :: href r :: attrs) children
