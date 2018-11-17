module Managing.Events.Page.EventList exposing (Model, Msg, init, initCmd, update, view)

import Html.Styled as H
import Http
import Managing.Request.RemoteData as RemoteData exposing (RemoteData)



-- MODEL


type alias EventListEntry =
    { kind : String }


type alias Model =
    { events : RemoteData (List EventListEntry)
    }


init =
    Model RemoteData.Requested



-- UPDATE


type Msg
    = ReceiveEvents (Result Http.Error (List EventListEntry))


initCmd : Model -> Cmd Msg
initCmd model =
    Cmd.none


update msg model =
    case msg of
        ReceiveEvents (Ok events) ->
            ( model, Cmd.none, Nothing )

        ReceiveEvents (Err e) ->
            ( model, Cmd.none , Nothing)



-- VIEW


view model =
    H.div [] [ H.text "Events" ]
