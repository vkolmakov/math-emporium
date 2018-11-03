module Managing.View.Input
    exposing
        ( text
        , select
        , InputConfig
        , SelectOption
        , toSelectOption
        )

import Html.Styled as H exposing (Attribute, Html)
import Html.Styled.Attributes as A
import Managing.Styles as Styles


-- TODO: generate ID and associate label with input


type alias InputConfig =
    { isEditable : Bool
    , isLabelHidden : Bool
    , label : String
    }


type SelectOption
    = SelectOption { label : String, value : String }


toSelectOption : { label : String, value : String } -> SelectOption
toSelectOption { label, value } =
    SelectOption { label = label, value = value }



-- TODO: Add a save button element


select : InputConfig -> List SelectOption -> SelectOption -> Attribute msg -> Html msg
select inputConfig options selectedOption onChange =
    let
        { isEditable } =
            inputConfig

        toOptionElement selectOption =
            case selectOption of
                SelectOption { label, value } ->
                    H.option
                        [ A.value value
                        , A.selected <| selectOption == selectedOption
                        ]
                        [ H.text label ]
    in
        baseInput
            inputConfig
            (H.select
                [ Styles.fieldTextInput
                , A.disabled <| not isEditable
                , onChange
                ]
                (List.map toOptionElement options)
            )


text inputConfig value onInput =
    let
        { isEditable } =
            inputConfig
    in
        baseInput
            inputConfig
            (H.input [ Styles.fieldTextInput, A.disabled <| not isEditable, A.value value, onInput ] [])


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
