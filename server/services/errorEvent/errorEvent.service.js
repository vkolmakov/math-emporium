import errorEventStorage from "./errorEventStorage";
import { dateTime } from "../../aux";

function transformErrorEvent(errorEvent) {
    const transformedErrorEvent = {
        userEmail: errorEvent.user && errorEvent.user.email,
        stacktrace: errorEvent.stacktrace,
        dataBlob: JSON.stringify(errorEvent.data),
        code: errorEvent.type,
        createdAtTimestamp: dateTime.toTimestamp(errorEvent.createdAt),
    };

    return transformedErrorEvent;
}

export function getAllErrorEvents() {
    return errorEventStorage
        .getAll()
        .then((errorEvents) => errorEvents.map(transformErrorEvent));
}
