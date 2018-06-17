module Managing.Main exposing (..)

import Html exposing (text)
import Navigation


type Msg
    = UrlChange Navigation.Location


type alias Model =
    {}


init location =
    let
        initialModel =
            {}
    in
        update (UrlChange location) initialModel


view model =
    text "Hello from Elm"


update msg model =
    case msg of
        UrlChange location ->
            ( model, Cmd.none )


main =
    Navigation.program UrlChange
        { init = init
        , view = view
        , update = update
        , subscriptions = \_ -> Sub.none
        }
