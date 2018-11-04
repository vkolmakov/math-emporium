module Managing.Users.Data.UserDetail exposing (UserDetail, decode)

import Json.Decode as Decode
import Managing.Users.Data.Shared exposing (AccessGroup, decodeAccessGroup)
import Managing.Utils.Date exposing (Date, decodeTimestamp)


type alias UserDetail =
    { id : Int
    , email : String
    , group : AccessGroup
    , phone : Maybe String
    , lastSigninDate : Date
    }


decode : Decode.Decoder UserDetail
decode =
    Decode.map5 UserDetail
        (Decode.field "id" Decode.int)
        (Decode.field "email" Decode.string)
        (Decode.field "group" Decode.int |> Decode.andThen decodeAccessGroup)
        (Decode.field "phoneNumber" <| Decode.nullable Decode.string)
        (Decode.field "lastSigninTimestamp" Decode.int |> Decode.andThen decodeTimestamp)
