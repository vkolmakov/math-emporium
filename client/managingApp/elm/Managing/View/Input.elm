module Managing.View.Input exposing (text, InputConfig)

import Html.Styled as H exposing (Attribute, Html)
import Html.Styled.Attributes as A
import Managing.Styles as Styles


-- TODO: generate ID and associate label with input


type alias InputConfig =
    { isEditable : Bool
    , isLabelHidden : Bool
    , label : String
    , value : String
    }



-- TODO: Add a single select input


text : InputConfig -> Html msg
text inputConfig =
    let
        { isEditable, value } =
            inputConfig
    in
        baseInput
            inputConfig
            (H.input [ Styles.fieldTextInput, A.disabled <| not isEditable, A.value value ] [])


baseInput : InputConfig -> Html msg -> Html msg
baseInput inputConfig inputElement =
    let
        { label, isLabelHidden } =
            inputConfig

        labelStyles =
            if isLabelHidden then
                Styles.fieldLabelHidden
            else
                Styles.fieldLabel

        labelElement =
            H.label [ labelStyles ] [ H.text label ]
    in
        H.div [ Styles.fieldGroup ]
            [ labelElement
            , inputElement
            ]
