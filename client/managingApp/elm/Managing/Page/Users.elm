module Managing.Page.Users exposing (Model, Msg, init, update, view)

import Html exposing (..)


-- MODEL


type alias ErrorMessage =
    String


type LoadingState
    = NotRequested
    | Loading
    | Error ErrorMessage


type alias Model =
    { users : Result LoadingState (List User) }


type alias User =
    { id : Int }


init =
    { users = Err NotRequested }



-- UPDATE


type Msg
    = GetUsers


update msg model =
    case msg of
        GetUsers ->
            ( model, Cmd.none )



-- VIEW


view : Model -> Html msg
view model =
    case model.users of
        Err loadingState ->
            case loadingState of
                NotRequested ->
                    div [] [ text "Users are not requested" ]

                Loading ->
                    div [] [ text "Loading" ]

                Error err ->
                    div [] [ text <| "An error ocurred: " ++ err ]

        Ok users ->
            div [] [ text <| "Got users: " ++ (users |> List.map (.id >> toString) |> String.join ", ") ]
