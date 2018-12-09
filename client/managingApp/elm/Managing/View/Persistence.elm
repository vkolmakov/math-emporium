module Managing.View.Persistence exposing
    ( view
    , viewPersistenceStatus
    , viewSubmitButton
    )

import Html as H exposing (Html)
import Managing.Request.RemoteData as RemoteData exposing (RemoteData)
import Managing.Styles as Styles
import Managing.View.Button as Button


viewPersistenceStatus : RemoteData a -> Html msg
viewPersistenceStatus persistenceState =
    let
        ( message, attributes ) =
            case persistenceState of
                RemoteData.Available _ ->
                    ( Just "Saved", [ Styles.apply [ Styles.utility.textColorSuccess ] ] )

                RemoteData.Error err ->
                    ( Just <| "Error: " ++ RemoteData.errorToString err, [ Styles.apply [ Styles.utility.textColorError ] ] )

                _ ->
                    ( Nothing, [] )
    in
    H.strong attributes [ H.text (Maybe.withDefault "" message) ]


viewSubmitButton : String -> msg -> RemoteData a -> Html msg
viewSubmitButton buttonId msg persistenceState =
    let
        buttonLabel =
            "Submit"

        buttonState =
            case persistenceState of
                RemoteData.StillLoading ->
                    Button.Loading

                RemoteData.Requested ->
                    Button.Disabled

                _ ->
                    Button.Enabled
    in
    Button.view buttonLabel buttonId buttonState msg


view : String -> msg -> RemoteData a -> Html msg
view buttonId msg persistenceState =
    H.div
        [ Styles.apply [ Styles.persistenceAction.self ] ]
        [ H.div
            [ Styles.apply [ Styles.persistenceAction.messageContainer ] ]
            [ viewPersistenceStatus persistenceState ]
        , viewSubmitButton buttonId msg persistenceState
        ]
