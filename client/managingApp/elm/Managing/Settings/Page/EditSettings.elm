module Managing.Settings.Page.EditSettings exposing
    ( Model
    , Msg
    , OutMsg(..)
    , init
    , initCmd
    , update
    , view
    )

import Html as H exposing (Html)
import Managing.AppConfig exposing (AppConfig)



-- MODEL


type alias Settings =
    { applicationTitle : String
    }


type alias Model =
    { applicationTitle : String }


init : AppConfig -> Model
init appConfig =
    Model ""



-- UPDATE


type Msg
    = NoOp


type OutMsg
    = NoOpOutMsg


initCmd : Model -> Cmd Msg
initCmd model =
    Cmd.none


update : Msg -> Model -> ( Model, Cmd Msg, Maybe OutMsg )
update msg model =
    let
        noOp =
            ( model, Cmd.none, Nothing )
    in
    case msg of
        NoOp ->
            noOp



-- VIEW


view : Model -> Html Msg
view model =
    H.div [] [ H.text "Settings" ]
