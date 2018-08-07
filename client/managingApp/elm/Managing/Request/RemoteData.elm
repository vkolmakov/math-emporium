module Managing.Request.RemoteData exposing (RemoteData(..), RemoteDataError(..))


type RemoteDataError
    = UnathorizedRequest
    | OtherError String


type RemoteData a
    = Loading
    | Error RemoteDataError
    | Available a
