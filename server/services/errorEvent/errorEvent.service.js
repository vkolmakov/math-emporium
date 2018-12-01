import errorEventStorage from "./errorEventStorage";
import { dateTime } from "../../aux";

function transformErrorEvent(errorEvent) {
    const userEmail = errorEvent.user && errorEvent.user.email;
    const transformedErrorEvent = {
        id: errorEvent._id,
        userEmail: userEmail ? userEmail : null,
        stacktrace: errorEvent.stacktrace,
        dataBlob: JSON.stringify(errorEvent.data),
        code: errorEvent.type,
        createdAtTimestamp: dateTime.toTimestamp(errorEvent.createdAt),
        url: errorEvent.url || "",
        query: errorEvent.query || "",
        body: errorEvent.body || "",
    };

    return transformedErrorEvent;
}

export function getAllErrorEvents() {
    return errorEventStorage
        .getAll()
        .then((errorEvents) => errorEvents.map(transformErrorEvent));
}
