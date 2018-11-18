module Managing.AppConfig exposing (AppConfig, create)


type alias AppConfig =
    { localTimezoneOffsetInMinutes : Int }


create : Int -> AppConfig
create localTimezoneOffsetInMinutes =
    AppConfig localTimezoneOffsetInMinutes
