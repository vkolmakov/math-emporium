module Managing.Route exposing (Route(..), fromLocation, toHref, href)

import Navigation
import UrlParser exposing (s, (</>))
import Html.Styled.Attributes as A


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
                [ UrlParser.map Users (s "users")
                , UrlParser.map UserDetail (s "users" </> UrlParser.int)
                ]
    in
        case (UrlParser.parseHash matchers location) of
            Just route ->
                route

            Nothing ->
                if (String.isEmpty location.hash) then
                    Home
                else
                    Unknown


toHref : Route -> String
toHref r =
    let
        path =
            case r of
                Home ->
                    ""

                Users ->
                    "users"

                UserDetail id ->
                    "users/" ++ toString id

                Unknown ->
                    ""
    in
        "#" ++ path


href route =
    A.href (toHref route)
