module Managing.View.Input exposing
    ( InputConfig
    , SelectOption
    , longText
    , select
    , text
    , toSelectOption
    )

import Html as H exposing (Attribute, Html)
import Html.Attributes as A
import Html.Events as E
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
            [ Styles.apply [ Styles.field.input ]
            , A.disabled <| not isEditable
            , onChange
            ]
            (List.map toOptionElement options)
        )


text inputConfig value onInputMsg =
    let
        { isEditable } =
            inputConfig
    in
    baseInput
        inputConfig
        (H.input
            [ Styles.apply [ Styles.field.input ]
            , A.disabled <| not isEditable
            , A.value value
            , E.onInput onInputMsg
            ]
            []
        )


longText inputConfig value onInputMsg =
    baseInput
        inputConfig
        (H.textarea
            [ Styles.apply [ Styles.field.longTextInput ]
            , A.value value
            , A.disabled <| not inputConfig.isEditable
            , E.onInput onInputMsg
            ]
            []
        )


baseInput : InputConfig -> Html msg -> Html msg
baseInput inputConfig inputElement =
    let
        { label, isLabelHidden } =
            inputConfig

        labelStyles =
            if isLabelHidden then
                [ Styles.field.label, Styles.field.labelHidden ]

            else
                [ Styles.field.label ]

        labelElement =
            H.label [ Styles.apply labelStyles ] [ H.text label ]
    in
    H.div [ Styles.apply [ Styles.field.self ] ]
        [ labelElement
        , inputElement
        ]
