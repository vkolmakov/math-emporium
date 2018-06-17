module Managing.Routing exposing (..)

import Html exposing (..)
import Html.Attributes exposing (href)
import Html.Events exposing (onWithOptions)
import Navigation
import Json.Decode as Decode
import UrlParser exposing (..)


type Route
    = HomeRoute
    | UsersRoute
    | UnknownRoute


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


link : msg -> String -> Html.Html msg
link msg path =
    let
        onClick =
            onWithOptions "click" { stopPropagation = False, preventDefault = True } (Decode.succeed msg)
    in
        a [ onClick, href path ] [ text path ]
