module Managing.Page.Users exposing (Model, Msg, init, initCmd, update, view)

import Html.Styled as H exposing (Attribute, Html)
import Html.Styled.Events exposing (onClick)
import Http
import Json.Decode as Decode
import Managing.Route as Route exposing (Route)
import Managing.Request.RemoteData as RemoteData
import Managing.Data.User exposing (User, accessGroupToString)
import Managing.View.DataTable as DataTable
import Managing.View.Loading exposing (spinner)
import Managing.Utils.DateUtils as DateUtils


-- MODEL


type alias Model =
    { users : RemoteData.RemoteData (List User)
    , cats : List Int
    }


init =
    Model RemoteData.Loading []


initCmd =
    getUsers



-- UPDATE


type Msg
    = ReceiveUsers (Result Http.Error (List User))


update msg model =
    case msg of
        ReceiveUsers (Ok users) ->
            ( { model | users = RemoteData.Available users }, Cmd.none )

        ReceiveUsers (Err e) ->
            ( { model | users = RemoteData.Error (RemoteData.OtherError <| toString e) }, Cmd.none )



-- VIEW


view model =
    let
        viewUserRow user =
            let
                labelsWithData =
                    [ ( "Email", user.email )
                    , ( "Group", accessGroupToString user.group )
                    , ( "Last sign-in date", DateUtils.toDisplayString user.lastSigninDate )
                    ]

                fields =
                    labelsWithData
                        |> List.map (\( label, entry ) -> DataTable.textElement label entry)

                actions =
                    [ DataTable.editLinkElement (Route.UserDetail user.id)
                    ]
            in
                DataTable.item (fields ++ actions)
    in
        case model.users of
            RemoteData.Loading ->
                spinner

            RemoteData.Available users ->
                DataTable.table (users |> List.map viewUserRow)

            RemoteData.Error e ->
                H.div [] [ H.text <| "An error ocurred: " ++ (toString e) ]



-- HTTP


getUsers : Cmd Msg
getUsers =
    let
        url =
            "/api/users"
    in
        Http.send ReceiveUsers (Http.get url (Managing.Data.User.decodeUser |> Decode.list))
