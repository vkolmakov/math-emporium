module Managing.Shared.Data.Appointment exposing
    ( Appointment(..)
    , AppointmentRef
    , appointmentStateToString
    , decodeAppointment
    , decodeAppointmentRef
    , getAppointmentRecord
    )

import Json.Decode as Json exposing (Decoder)
import Managing.Utils.Date as Date exposing (Date)


type Appointment
    = DeletedAppointment AppointmentRecord
    | ActiveAppointment AppointmentRecord


type alias AppointmentRecord =
    { id : Int
    , time : Date
    , course : String
    , location : String
    , user : String
    }


type alias AppointmentRef =
    { id : Int }


appointmentStateToString : Appointment -> String
appointmentStateToString appointment =
    case appointment of
        DeletedAppointment record ->
            "Deleted"

        ActiveAppointment record ->
            "Active"


getAppointmentRecord : Appointment -> AppointmentRecord
getAppointmentRecord appointment =
    case appointment of
        DeletedAppointment record ->
            record

        ActiveAppointment record ->
            record


decodeAppointmentRecord : Decoder AppointmentRecord
decodeAppointmentRecord =
    Json.map5 AppointmentRecord
        (Json.field "id" Json.int)
        (Json.field "timestamp" Json.int |> Json.andThen Date.decodeTimestamp)
        (Json.field "course" Json.string)
        (Json.field "location" Json.string)
        (Json.field "user" Json.string)


decodeAppointment : Decoder Appointment
decodeAppointment =
    let
        decodeAppointmentWithState isDeleted =
            case isDeleted of
                True ->
                    Json.map DeletedAppointment decodeAppointmentRecord

                False ->
                    Json.map ActiveAppointment decodeAppointmentRecord
    in
    Json.field "isDeleted" Json.bool
        |> Json.andThen decodeAppointmentWithState


decodeAppointmentRef : Decoder AppointmentRef
decodeAppointmentRef =
    Json.map AppointmentRef
        (Json.field "id" Json.int)
