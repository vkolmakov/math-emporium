module Managing.View.Input exposing (text)

import Html.Styled as H exposing (Attribute, Html)
import Html.Styled.Attributes as A
import Managing.Styles as Styles


-- TODO: generate ID and associate label with input


text : String -> String -> Bool -> Bool -> Html msg
text label value isEditable isLabelHidden =
    case isLabelHidden of
        False ->
            let
                fieldLabel =
                    H.label
                        [ Styles.fieldLabel
                        ]
                        [ H.text label ]

                fieldInput =
                    H.input [ Styles.fieldTextInput, A.disabled <| not isEditable, A.value value ] []
            in
                H.div
                    [ Styles.fieldGroup ]
                    [ fieldLabel
                    , fieldInput
                    ]

        True ->
            let
                fieldLabel =
                    H.label
                        [ Styles.fieldLabelHidden ]
                        [ H.text label ]

                fieldInput =
                    H.input [ Styles.fieldTextInput, A.disabled <| not isEditable, A.value value ] []
            in
                H.div
                    [ Styles.fieldGroup ]
                    [ fieldLabel
                    , fieldInput
                    ]
