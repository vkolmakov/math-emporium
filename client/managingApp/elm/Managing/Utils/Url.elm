module Managing.Utils.Url exposing (Url, fromString, toString)


type Url
    = Url String


fromString : String -> Url
fromString s =
    Url s


toString : Url -> String
toString (Url s) =
    s
