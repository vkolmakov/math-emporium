module Managing.Styles exposing
    ( applicationContainer
    , apply
    , button
    , dataList
    , field
    , loadingSpinner
    , modal
    , persistenceAction
    , sectionNav
    , utility
    )

import Html exposing (Attribute)
import Html.Attributes as A



-- CONVERTED


apply : List String -> Attribute msg
apply classList =
    A.class (String.join " " classList)


button =
    { primary = "m-button m-button--primary"
    , disabled = "m-button m-button--disabled"
    , loading = "m-button m-button--loading"
    , asLink = "m-button m-button--as-link"
    }


sectionNav =
    { self = "m-section-nav"
    , item = "m-section-nav__item"
    , link = "m-section-nav__link"
    , linkHighlighted = "m-section-nav__link--highlighted"
    }


applicationContainer =
    { self = "m-application-container"
    , pageContent = "m-application-container__page-content"
    }


loadingSpinner =
    { self = "m-loading-spinner"
    , small = "m-loading-spinner--small"
    }


utility =
    { centeredFlexContainer = "utility__centered-flex-container"
    , boldText = "utility__bold-text"
    , textColorSuccess = "utility__text-color-success"
    , textColorError = "utility__text-color-error"
    }


dataList =
    { self = "m-data-list"
    , item = "m-data-list__item"
    , itemField = "m-data-list__item__field"
    , itemFieldLabel = "m-data-list__item__field__label"
    , itemFieldValue = "m-data-list__item__field__value"
    , itemActions = "m-data-list__item__actions"
    }


persistenceAction =
    { self = "m-persistence-action"
    , messageContainer = "m-persistence-action__message-container"
    }


field =
    { self = "m-field"
    , label = "m-field__label"
    , labelHidden = "m-field__label--hidden"
    , input = "m-field__input"
    }


modal =
    { self = "m-modal"
    , scheduledAppointmentDetailsModalContent = "m-modal__scheduled-appointment-details-modal-content"
    }
