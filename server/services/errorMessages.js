export function notFound(item) {
    return {
        error: `Selected ${item} was not found.`,
        status: 404,
    };
}

export function unauthorized() {
    return {
        error: "Unauthorized request. Please sign in.",
        status: 401,
    };
}

export function isRequired(item) {
    return {
        error: `${item} is required`,
        status: 422,
    };
}

export function actionFailed(action, item = "", explanation = "") {
    return {
        error: `Could not ${action} ${item}${
            explanation ? ": " + explanation : ""
        }`,
        status: 422,
    };
}

export function errorMessage(message, status) {
    return {
        error: message,
        status,
    };
}

export function isCustomError(obj) {
    return typeof obj.error === "string" && typeof obj.status === "number";
}

export function getValidationErrorText(err) {
    const ERROR_TEXT = {
        UNKNOWN: "An unknown error occurred",
        TOO_LONG: "The value of a field is too long",
        INVALID_PHONE_NUMBER: "Invalid phone number",
    };

    const SEQUELIZE_ERROR_NAME = {
        DATABASE: "SequelizeDatabaseError",
    };

    const ERROR_MESSAGE_TOKENS = {
        TOO_LONG: "too long",
        PHONE_NUMBER: "phone",
    };

    function hasToken(token, err) {
        const message = err.message ? err.message.toLowerCase() : "";
        return message.includes(token);
    }

    function convertSequelizeDatabaseErrorMessage(err) {
        if (hasToken(ERROR_MESSAGE_TOKENS.TOO_LONG, err)) {
            return ERROR_TEXT.TOO_LONG;
        }

        return ERROR_TEXT.UNKNOWN;
    }

    function convertGenericErrorMessage(err) {
        if (hasToken(ERROR_MESSAGE_TOKENS.PHONE_NUMBER, err)) {
            return ERROR_TEXT.INVALID_PHONE_NUMBER;
        }

        return ERROR_TEXT.UNKNOWN;
    }

    if (err.name === SEQUELIZE_ERROR_NAME.DATABASE) {
        return convertSequelizeDatabaseErrorMessage(err);
    } else if (err.message) {
        return convertGenericErrorMessage(err);
    }

    return ERROR_TEXT.UNKNOWN;
}
