export function notFound(item) {
    return {
        error: `Selected ${item} was not found`,
        status: 404,
    };
}

export function isRequired(item) {
    return {
        error: `${item} is required`,
        status: 422,
    };
}

export function actionFailed(action, item = '', explanation = '') {
    return {
        error: `Could not ${action} ${item}${!!explanation ? ': ' + explanation : ''}`,
        status: 422,
    };
}

export function errorMessage(message, status) {
    return {
        error: message,
        status,
    };
}

export function getValidationErrorText(err) {
    const ERROR_TEXT = {
        UNKNOWN: 'An unknown error occurred',
        TOO_LONG: 'The value of a field is too long',
    };

    const SEQUELIZE_ERROR_NAME = {
        DATABASE: 'SequelizeDatabaseError',
    };

    const ERROR_MESSAGE_TOKENS = {
        TOO_LONG: 'too long',
    };

    function convertSequelizeDatabaseErrorMessage(err) {
        const message = !!err.message ? err.message.toLowerCase() : '';

        if (message.includes(ERROR_MESSAGE_TOKENS.TOO_LONG)) {
            return ERROR_TEXT.TOO_LONG;
        }

        return ERROR_TEXT.UNKNOWN;
    }


    if (err.name === SEQUELIZE_ERROR_NAME.DATABASE) {
        return convertSequelizeDatabaseErrorMessage(err);
    }

    return ERROR_TEXT.UNKNOWN;
}
