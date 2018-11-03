module Managing.Users.Data.Shared
    exposing
        ( AccessGroup(..)
        , decodeDate
        , decodeAccessGroup
        , accessGroupToString
        , accessGroupToInt
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


getAccessGroupTranslation group =
    case group of
        UserGroup ->
            { id = 1, label = "User" }

        EmployeeGroup ->
            { id = 2, label = "Employee" }

        EmployerGroup ->
            { id = 3, label = "Employer" }

        AdminGroup ->
            { id = 4, label = "Admin" }


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
accessGroupToString =
    .label << getAccessGroupTranslation


accessGroupToInt : AccessGroup -> Int
accessGroupToInt =
    .id << getAccessGroupTranslation
