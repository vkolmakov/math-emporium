module Managing.Users.Data.UserListEntry exposing (UserListEntry, decode)

import Date exposing (Date)
import Json.Decode as Decode
import Managing.Users.Data.Shared exposing (AccessGroup, decodeAccessGroup, decodeDate)


type alias UserListEntry =
    { id : Int
    , email : String
    , group : AccessGroup
    , lastSigninDate : Date
    }


decode : Decode.Decoder UserListEntry
decode =
    Decode.map4 UserListEntry
        (Decode.field "id" Decode.int)
        (Decode.field "email" Decode.string)
        (Decode.field "group" Decode.int |> Decode.andThen decodeAccessGroup)
        (Decode.field "lastSigninAt" Decode.string |> Decode.andThen decodeDate)
