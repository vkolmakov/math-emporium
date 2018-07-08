module Managing.Route exposing (Route(..), fromLocation, toHref)

import Navigation
import UrlParser exposing (s, (</>))


type Route
    = Home
    | Users
    | UserDetail Int
    | Unknown


fromLocation : Navigation.Location -> Route
fromLocation location =
    let
        matchers =
            UrlParser.oneOf
                [ UrlParser.map Home (s "manage-portal")
                , UrlParser.map Users (s "manage-portal" </> s "users")
                , UrlParser.map UserDetail (s "manage-portal" </> s "users" </> UrlParser.int)
                ]
    in
        case (UrlParser.parsePath matchers location) of
            Just route ->
                route

            Nothing ->
                Unknown


toHref : Route -> String
toHref r =
    case r of
        Home ->
            "/manage-portal"

        Users ->
            "/manage-portal/users"

        UserDetail id ->
            "/manage-portal/users/" ++ toString id

        Unknown ->
            "/manage-portal"
