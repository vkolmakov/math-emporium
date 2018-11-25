module Managing.ErrorEvents.Page.ErrorEventList exposing (Model, Msg, OutMsg(..), init, initCmd, update, view)

import Html as H exposing (Html)
import Managing.AppConfig exposing (AppConfig)



-- MODEL


type alias Model =
    {}


init : AppConfig -> Model
init appConfig =
    {}



-- UPDATE


type Msg
    = NoOp


type OutMsg
    = NoOutMsg


initCmd : Model -> Cmd Msg
initCmd model =
    Cmd.none


update : Msg -> Model -> ( Model, Cmd Msg, Maybe OutMsg )
update msg model =
    case msg of
        NoOp ->
            ( model, Cmd.none, Nothing )



-- VIEW


view : Model -> Html Msg
view model =
    H.div [] [ H.text "Errors" ]
