module Managing.Utils.Browser exposing (attemptFocus)

import Browser.Dom as Dom
import Task


attemptFocus msg elementId =
    Task.attempt (\_ -> msg) (Dom.focus elementId)
