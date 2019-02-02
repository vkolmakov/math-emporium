module Managing.Utils.Date exposing
    ( Date
    , TimezoneOffset
    , addDays
    , createTimezoneOffsetInMinutes
    , dateToTimestamp
    , decodeTimestamp
    , timestampToDate
    , toCompactDateDisplayString
    , toDebugTimestampString
    , toDisplayString
    )

import Json.Decode as Json
import Time exposing (Month(..), Posix, Weekday(..))


minutesToMilliseconds : Int -> Int
minutesToMilliseconds minutes =
    minutes * 60 * 1000


hoursToMilliseconds : Int -> Int
hoursToMilliseconds hours =
    minutesToMilliseconds (hours * 60)


daysToMilliseconds : Int -> Int
daysToMilliseconds numDays =
    hoursToMilliseconds (24 * numDays)


type TimezoneOffset
    = TimezoneOffsetInMinutes Int


createTimezoneOffsetInMinutes : Int -> TimezoneOffset
createTimezoneOffsetInMinutes minutes =
    TimezoneOffsetInMinutes minutes


type Date
    = Date Posix


dateToTimestamp : Date -> Int
dateToTimestamp (Date posixTimestamp) =
    Time.posixToMillis posixTimestamp


timestampToDate : Int -> Date
timestampToDate timestamp =
    Date <| Time.millisToPosix timestamp


addDays : Int -> Date -> Date
addDays numDays date =
    date
        |> dateToTimestamp
        |> (\timestamp -> timestamp + daysToMilliseconds numDays)
        |> timestampToDate


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


monthToString : Month -> String
monthToString month =
    case month of
        Jan ->
            "January"

        Feb ->
            "February"

        Mar ->
            "March"

        Apr ->
            "April"

        May ->
            "May"

        Jun ->
            "June"

        Jul ->
            "July"

        Aug ->
            "August"

        Sep ->
            "September"

        Oct ->
            "October"

        Nov ->
            "November"

        Dec ->
            "December"


monthToNumber : Month -> Int
monthToNumber month =
    case month of
        Jan ->
            1

        Feb ->
            2

        Mar ->
            3

        Apr ->
            4

        May ->
            5

        Jun ->
            6

        Jul ->
            7

        Aug ->
            8

        Sep ->
            9

        Oct ->
            10

        Nov ->
            11

        Dec ->
            12


timezone =
    Time.utc


toDisplayString : TimezoneOffset -> Date -> String
toDisplayString (TimezoneOffsetInMinutes timezoneOffsetInMinutes) (Date timestamp) =
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
            , monthToString << Time.toMonth timezone
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


toCompactDateDisplayString : TimezoneOffset -> Date -> String
toCompactDateDisplayString (TimezoneOffsetInMinutes timezoneOffsetInMinutes) (Date timestamp) =
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
            [ String.padLeft 2 '0' << String.fromInt << monthToNumber << Time.toMonth timezone
            , symbol "/"
            , String.padLeft 2 '0' << String.fromInt << Time.toDay timezone
            , symbol "/"
            , String.fromInt << Time.toYear timezone
            ]
    in
    List.map (\tok -> tok localizedTimestamp) toks
        |> String.join ""


toDebugTimestampString : TimezoneOffset -> Date -> String
toDebugTimestampString (TimezoneOffsetInMinutes timezoneOffsetInMinutes) (Date timestamp) =
    let
        timezoneOffsetInMilliseconds =
            minutesToMilliseconds timezoneOffsetInMinutes
    in
    timestamp
        |> Time.posixToMillis
        -- |> (\m -> m - timezoneOffsetInMilliseconds)
        |> String.fromInt


decodeTimestamp : Int -> Json.Decoder Date
decodeTimestamp timestamp =
    Json.succeed (timestampToDate timestamp)
