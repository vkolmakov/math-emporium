module Managing.Request.RemoteData exposing
    ( RemoteData(..)
    , RemoteDataError(..)
    , scheduleLoadingStateTrigger
    )

import Process
import Task


delayBeforeTooLong =
    150


scheduleLoadingStateTrigger : msg -> Cmd msg
scheduleLoadingStateTrigger msg =
    Process.sleep delayBeforeTooLong |> Task.perform (always msg)


type RemoteDataError
    = UnathorizedRequest
    | OtherError String


type RemoteData a
    = NotRequested
    | Requested
    | StillLoading -- Intermediate state - data is loading for a long time after the request was made
    | Error RemoteDataError
    | Available a
