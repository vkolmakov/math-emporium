module Managing.View.PageMessage exposing (PageMessage(..), viewPageError, viewPageMessage)

import Html as H exposing (Html)
import Html.Events as E
import Managing.Styles as Styles
import Managing.Utils.RemoteData as RemoteData exposing (RemoteDataError)


type PageMessage
    = NoItemsAvailable
    | Error RemoteDataError


pageMessageToString : PageMessage -> String
pageMessageToString pageMessage =
    case pageMessage of
        NoItemsAvailable ->
            "There are no items available"

        Error remoteDataErr ->
            "Error: " ++ RemoteData.errorToString remoteDataErr


viewPageMessageWithAdditionalContent : List (Html msg) -> PageMessage -> Html msg
viewPageMessageWithAdditionalContent additionalContent pageMessage =
    let
        viewPageMessageText =
            H.h2 [ Styles.apply [ Styles.pageMessage.text ] ]
                [ H.text (pageMessageToString pageMessage) ]
    in
    H.div [ Styles.apply [ Styles.pageMessage.self ] ]
        ([ viewPageMessageText ] ++ additionalContent)


viewPageMessage : PageMessage -> Html msg
viewPageMessage pageMessage =
    viewPageMessageWithAdditionalContent [] pageMessage


viewPageError : msg -> RemoteDataError -> Html msg
viewPageError onRetryMsg remoteDataErr =
    let
        retryButton =
            H.button [ Styles.apply [ Styles.button.primary ], E.onClick onRetryMsg ] [ H.text "Retry" ]

        pageMessage =
            Error remoteDataErr
    in
    viewPageMessageWithAdditionalContent [ retryButton ] pageMessage
