export function notFound(item) {
    return {
        error: `Selected ${item} was not found`,
    };
}

export function isRequired(item) {
    return {
        error: `${item} is required`,
    };
}

export function actionFailed(action, item='') {
    return {
        error: `Could not ${action} ${item}`,
    };
}

export function errorMessage(message) {
    return {
        error: message,
    };
}
