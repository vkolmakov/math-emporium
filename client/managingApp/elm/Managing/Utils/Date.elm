module Managing.Utils.Date exposing
    ( Date
    , decodeTimestamp
    , toDisplayString
    )

import Json.Decode as Json
import Time exposing (Posix, Weekday(..))


toMilliseconds hours =
    hours * 3600 * 1000

{-| Hack for now until there is a better way to
    get the current timezone.
-}
timezoneOffsetMilliseconds =
    -(toMilliseconds 5)


type Date
    = Date Posix


timestampToDate : Int -> Date
timestampToDate timestamp =
    Date <| Time.millisToPosix (timestamp + timezoneOffsetMilliseconds)



weekdayToString : Weekday -> String
weekdayToString d =
    case d of
        Mon ->
            "Monday"

        Tue ->
            "Tuesday"

        Wed ->
            "Wednesday"

        Thu ->
            "Thursday"

        Fri ->
            "Friday"

        Sat ->
            "Saturday"

        Sun ->
            "Sunday"


timezone =
    Time.utc


toDisplayString : Date -> String
toDisplayString (Date timestamp) =
    let
        symbol s =
            \_ -> s

        toks =
            [ weekdayToString << Time.toWeekday timezone
            , symbol ", "
            , Debug.toString << Time.toMonth timezone
            , symbol " "
            , String.fromInt << Time.toDay timezone
            , symbol " "
            , String.fromInt << Time.toYear timezone
            , symbol ", "
            , String.fromInt << Time.toHour timezone
            , symbol ":"
            , String.padLeft 2 '0' << String.fromInt << Time.toMinute timezone
            ]
    in
    List.map (\tok -> tok timestamp) toks
        |> String.join ""


decodeTimestamp : Int -> Json.Decoder Date
decodeTimestamp timestamp =
    Json.succeed (timestampToDate timestamp)
