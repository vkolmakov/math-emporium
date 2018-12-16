module Managing.View.RemoteData exposing (viewItemList)

import Html as H exposing (Html)
import Managing.Utils.RemoteData as RemoteData exposing (RemoteData)
import Managing.View.DataTable as DataTable
import Managing.View.Loading exposing (spinner)
import Managing.View.PageError exposing (viewPageError)


viewItemList : RemoteData (List a) -> (a -> Html msg) -> msg -> Html msg
viewItemList pageContent viewListEntry retryOnErrorMsg =
    case pageContent of
        RemoteData.NotRequested ->
            H.div [] []

        RemoteData.Requested ->
            H.div [] []

        RemoteData.StillLoading ->
            spinner

        RemoteData.Available xs ->
            H.div []
                [ xs |> List.map viewListEntry |> DataTable.table
                ]

        RemoteData.Error err ->
            viewPageError retryOnErrorMsg err
