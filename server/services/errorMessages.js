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
