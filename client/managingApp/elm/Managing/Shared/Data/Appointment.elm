module Managing.Shared.Data.Appointment exposing
    ( Appointment
    , AppointmentRef
    , decodeAppointment
    , decodeAppointmentRef
    )

import Json.Decode as Json
import Managing.Utils.Date as Date exposing (Date)


type alias Appointment =
    { id : Int
    , time : Date
    , course : String
    , location : String
    , user : String
    }


type alias AppointmentRef =
    { id : Int }


decodeAppointment =
    Json.map5 Appointment
        (Json.field "id" Json.int)
        (Json.field "timestamp" Json.int |> Json.andThen Date.decodeTimestamp)
        (Json.field "course" Json.string)
        (Json.field "location" Json.string)
        (Json.field "user" Json.string)


decodeAppointmentRef =
    Json.map AppointmentRef
        (Json.field "id" Json.int)
