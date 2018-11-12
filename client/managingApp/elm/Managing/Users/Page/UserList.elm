module Managing.Users.Page.UserList exposing (Model, Msg, OutMsg(..), init, initCmd, update, view)

import Html.Styled as H exposing (Attribute, Html)
import Http
import Json.Decode as Decode
import Managing.Request.RemoteData as RemoteData
import Managing.Route as Route exposing (Route)
import Managing.Users.Data.Shared exposing (accessGroupToString)
import Managing.Users.Data.UserListEntry exposing (UserListEntry)
import Managing.Utils.Date as Date
import Managing.View.DataTable as DataTable
import Managing.View.Loading exposing (spinner)



-- MODEL


type alias Model =
    { users : RemoteData.RemoteData (List UserListEntry)
    }


init =
    Model RemoteData.Loading


initCmd : Model -> Cmd Msg
initCmd model =
    case model.users of
        RemoteData.Loading ->
            getUsers

        RemoteData.Error _ ->
            Cmd.none

        RemoteData.Available _ ->
            Cmd.none



-- UPDATE


type Msg
    = ReceiveUsers (Result Http.Error (List UserListEntry))
    | NavigateTo Route


type OutMsg
    = RequestNavigationTo Route


update : Msg -> Model -> ( Model, Cmd msg, Maybe OutMsg )
update msg model =
    case msg of
        ReceiveUsers (Ok users) ->
            ( { model | users = RemoteData.Available users }, Cmd.none, Nothing )

        ReceiveUsers (Err e) ->
            ( { model | users = RemoteData.Error (RemoteData.OtherError <| Debug.toString e) }, Cmd.none, Nothing )

        NavigateTo r ->
            ( model, Cmd.none, Just (RequestNavigationTo r) )



-- VIEW


view model =
    let
        viewUserRow user =
            let
                labelsWithData =
                    [ ( "Email", user.email )
                    , ( "Group", accessGroupToString user.group )
                    , ( "Last Sign-in Date", Date.toDisplayString user.lastSigninDate )
                    ]

                fields =
                    labelsWithData
                        |> List.map (\( label, entry ) -> DataTable.textField label entry)

                actions =
                    DataTable.actionContainer
                        [ DataTable.editLink
                            (NavigateTo <| Route.UserDetail user.id)
                            (Route.UserDetail user.id)
                        ]
            in
            DataTable.item (fields ++ [ actions ])
    in
    case model.users of
        RemoteData.Loading ->
            spinner

        RemoteData.Available users ->
            DataTable.table (users |> List.map viewUserRow)

        RemoteData.Error e ->
            H.div [] [ H.text <| "An error ocurred: " ++ Debug.toString e ]



-- HTTP


getUsers : Cmd Msg
getUsers =
    let
        url =
            "/api/users"
    in
    Http.send ReceiveUsers (Http.get url (Managing.Users.Data.UserListEntry.decode |> Decode.list))