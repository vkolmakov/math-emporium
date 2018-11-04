module Managing.Users.Data.UserListEntry exposing (UserListEntry, decode)

import Json.Decode as Decode
import Managing.Users.Data.Shared exposing (AccessGroup, decodeAccessGroup)
import Managing.Utils.Date exposing (Date, decodeTimestamp)


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
        (Decode.field "lastSigninTimestamp" Decode.int |> Decode.andThen decodeTimestamp)
