module Managing.Users.Data.Shared
    exposing
        ( AccessGroup(..)
        , decodeDate
        , decodeAccessGroup
        , accessGroupToString
        )

import Date exposing (Date)
import Json.Decode as Decode


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
