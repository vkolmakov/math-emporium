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


view label state msg =
    case state of
        Loading ->
            viewLoading label

        _ ->
            viewBase label msg state


baseAttrs label =
    -- data-text is required to keep the size of the button constant
    -- if we need to change the button content to a loading spinner
    [ A.attribute "data-text" label, Styles.primaryButton ]


viewBase label msg state =
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
        (baseAttrs label ++ additionalStyles ++ [ E.onClick msg, A.disabled isDisabled ])
        [ H.text label ]


viewLoading label =
    H.button (A.disabled True :: baseAttrs label) [ Loading.viewInlineSpinner ]
