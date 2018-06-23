module Managing.Main exposing (..)

import Html as H exposing (Html)
import Managing.Styles as Styles


main : Program Never Model Msg
main =
    H.program
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }



-- MODEL


type alias Model =
    { stuff : Maybe String
    }


init : ( Model, Cmd Msg )
init =
    ( Model Nothing
    , Cmd.none
    )



-- UPDATE


type Msg
    = ChangeStuff


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        ChangeStuff ->
            ( model, Cmd.none )



-- VIEW


view : Model -> Html Msg
view model =
    H.div [ Styles.mainContainerStyle ]
        [ H.h1 [] [ H.text "Stuff" ]
        ]



-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.none



-- HTTP
