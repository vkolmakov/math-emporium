module Managing.Utils.DateUtils exposing (toDisplayString)

import Date exposing (Date)


toDisplayString : Date -> String
toDisplayString date =
    let
        symbol s =
            \_ -> s

        toks =
            [ toString << Date.dayOfWeek
            , symbol ", "
            , toString << Date.month
            , symbol " "
            , toString << Date.day
            , symbol " "
            , toString << Date.year
            , symbol ", "
            , toString << Date.hour
            , symbol ":"
            , String.padLeft 2 '0' << toString << Date.minute
            ]
    in
        List.map (\tok -> tok date) toks
            |> String.join ""
