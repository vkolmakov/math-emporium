module Managing.AppConfig exposing (AppConfig, create)

import Managing.Utils.Date exposing (TimezoneOffset, createTimezoneOffsetInMinutes)


type alias AppConfig =
    { localTimezoneOffsetInMinutes : TimezoneOffset }


create : Int -> AppConfig
create localTimezoneOffsetInMinutes =
    AppConfig (createTimezoneOffsetInMinutes localTimezoneOffsetInMinutes)
