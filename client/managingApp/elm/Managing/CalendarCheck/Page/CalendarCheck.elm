module Managing.CalendarCheck.Page.CalendarCheck exposing
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
import Managing.Utils.Date exposing (Date)



-- MODEL


type alias LocationRef =
    { id : Int }


type alias Model =
    { appConfig : AppConfig
    , selectedStartDate : Maybe Date
    , selectedEndDate : Maybe Date
    , selectedLocation : Maybe LocationRef
    }


init : AppConfig -> Model
init appConfig =
    Model appConfig Nothing Nothing Nothing



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
    case msg of
        NoOp ->
            ( model, Cmd.none, Nothing )



-- VIEW


view : Model -> Html Msg
view model =
    H.div [] [ H.text "Calendar Check Page" ]
