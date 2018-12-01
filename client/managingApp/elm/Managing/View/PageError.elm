module Managing.View.PageError exposing (viewPageError)

import Html as H exposing (Html)
import Html.Events as E
import Managing.Request.RemoteData as RemoteData
import Managing.Styles as Styles


viewPageError : msg -> RemoteData.RemoteDataError -> Html msg
viewPageError onRetry err =
    H.div [ Styles.apply [ Styles.pageError.self ] ]
        [ H.h2 [ Styles.apply [ Styles.pageError.message ] ]
            [ H.text ("Error: " ++ RemoteData.errorToString err) ]
        , H.button [ Styles.apply [ Styles.button.primary ], E.onClick onRetry ] [ H.text "Retry" ]
        ]
