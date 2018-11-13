module Managing.View.Button exposing (ButtonState(..), view)

import Html.Styled as H
import Html.Styled.Attributes as A
import Html.Styled.Events as E
import Managing.Styles as Styles
import Managing.View.Loading as Loading


type ButtonState
    = Loading
    | Disabled
    | VisuallyDisabled
    | Enabled


view label id state msg =
    case state of
        Loading ->
            viewLoading label id

        _ ->
            viewBase label id msg state


baseAttrs label id =
    -- data-text is required to keep the size of the button constant
    -- if we need to change the button content to a loading spinner
    [ A.id id, A.attribute "data-text" label, Styles.primaryButton ]


viewBase label id msg state =
    let
        ( isDisabled, additionalStyles ) =
            case state of
                VisuallyDisabled ->
                    ( True, [ Styles.primaryButtonDisabled ] )

                Disabled ->
                    ( True, [] )

                Enabled ->
                    ( False, [ Styles.primaryButtonEnabled ] )

                Loading ->
                    -- should never happen here
                    ( True, [] )
    in
    H.button
        (baseAttrs label id ++ additionalStyles ++ [ E.onClick msg, A.disabled isDisabled ])
        [ H.text label ]


viewLoading label id =
    H.button (A.disabled True :: baseAttrs label id) [ Loading.viewInlineSpinner ]
