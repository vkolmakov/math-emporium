module Managing.Data.User exposing (User, UserDetail, decodeUser, decodeUserDetail, accessGroupToString)

import Date exposing (Date)
import Json.Decode as Decode


type alias User =
    { id : Int
    , email : String
    , group : AccessGroup
    , lastSigninDate : Date
    }


type alias UserDetail =
    { id : Int
    , email : String
    , group : AccessGroup
    , phone : Maybe String
    , lastSigninDate : Date
    }


decodeUser : Decode.Decoder User
decodeUser =
    Decode.map4 User
        (Decode.field "id" Decode.int)
        (Decode.field "email" Decode.string)
        (Decode.field "group" Decode.int |> Decode.andThen decodeAccessGroup)
        (Decode.field "lastSigninAt" Decode.string |> Decode.andThen decodeDate)


decodeUserDetail : Decode.Decoder UserDetail
decodeUserDetail =
    Decode.map5 UserDetail
        (Decode.field "id" Decode.int)
        (Decode.field "email" Decode.string)
        (Decode.field "group" Decode.int |> Decode.andThen decodeAccessGroup)
        (Decode.field "phoneNumber" <| Decode.nullable Decode.string)
        (Decode.field "lastSigninAt" Decode.string |> Decode.andThen decodeDate)


accessGroupToString : AccessGroup -> String
accessGroupToString group =
    case group of
        UserGroup ->
            "User"

        EmployeeGroup ->
            "Employee"

        EmployerGroup ->
            "Employer"

        AdminGroup ->
            "Admin"



-- INTERNAL


type AccessGroup
    = UserGroup
    | EmployeeGroup
    | EmployerGroup
    | AdminGroup


decodeDate : String -> Decode.Decoder Date
decodeDate date =
    case Date.fromString date of
        Ok d ->
            Decode.succeed d

        Err e ->
            Decode.fail e


decodeAccessGroup : Int -> Decode.Decoder AccessGroup
decodeAccessGroup groupId =
    case groupId of
        1 ->
            Decode.succeed UserGroup

        2 ->
            Decode.succeed EmployeeGroup

        3 ->
            Decode.succeed EmployerGroup

        4 ->
            Decode.succeed AdminGroup

        _ ->
            Decode.fail "Unknown access group ID"
