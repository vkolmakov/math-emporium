module Managing.Routing exposing (..)

import Html exposing (..)
import Html.Attributes exposing (href)
import Html.Events exposing (onWithOptions)
import Navigation
import Json.Decode as Decode
import UrlParser exposing (..)
import Managing.Data.Routing exposing (..)


matchers : Parser (Route -> c) c
matchers =
    UrlParser.oneOf
        [ UrlParser.map HomeRoute (UrlParser.s "manage-portal")
        , UrlParser.map UsersRoute (UrlParser.s "manage-portal" </> UrlParser.s "users")
        ]


parseLocation : Navigation.Location -> Route
parseLocation location =
    case (UrlParser.parsePath matchers location) of
        Just route ->
            route

        Nothing ->
            UnknownRoute


encodeRoute : Route -> String
encodeRoute route =
    case route of
        HomeRoute ->
            "/manage-portal"

        UsersRoute ->
            "/manage-portal/users"

        UnknownRoute ->
            "/manage-portal"


link route msg attrs =
    let
        onClick =
            onWithOptions "click" { stopPropagation = False, preventDefault = True } (Decode.succeed msg)
    in
        a ([ onClick, href (encodeRoute route) ] ++ attrs)
