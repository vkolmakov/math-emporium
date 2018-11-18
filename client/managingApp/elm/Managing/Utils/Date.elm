module Managing.Utils.Date exposing
    ( Date
    , decodeTimestamp
    , toDisplayString
    )

import Json.Decode as Json
import Time exposing (Posix, Weekday(..))


minutesToMilliseconds minutes =
    minutes * 60 * 1000


type Date
    = Date Posix


timestampToDate : Int -> Date
timestampToDate timestamp =
    Date <| Time.millisToPosix timestamp


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


toDisplayString : Int -> Date -> String
toDisplayString timezoneOffsetInMinutes (Date timestamp) =
    let
        symbol s =
            \_ -> s

        timezoneOffsetInMilliseconds =
            minutesToMilliseconds timezoneOffsetInMinutes

        {- There appears to be no way to create a Time.Zone object
           so instead of passing in our timezone, we are manually adjusting
           the timestamp by the value that was passed in as a first parameter
           to this function
        -}
        localizedTimestamp =
            Time.posixToMillis timestamp
                |> (\milliseconds -> milliseconds - timezoneOffsetInMilliseconds)
                |> Time.millisToPosix

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
    List.map (\tok -> tok localizedTimestamp) toks
        |> String.join ""


decodeTimestamp : Int -> Json.Decoder Date
decodeTimestamp timestamp =
    Json.succeed (timestampToDate timestamp)
