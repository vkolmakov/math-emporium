import eventStorage from "../eventStorage";
import { dateTime } from "../../aux";

function transformEvent(event) {
    const transformedEvent = {
        user: { email: event.user.email },
        type: event.type,
        createdAtTimestamp: dateTime.toTimestamp(event.createdAt),
    };

    if (typeof event.data === "object") {
        transformedEvent.data = {};
        if (
            typeof event.data.appointment === "object" &&
            typeof event.data.appointment.id === "number"
        ) {
            transformedEvent.data = {
                appointment: { id: event.data.appointment.id },
            };
        }
    }

    return transformedEvent;
}

export function getAllEvents() {
    return eventStorage.getAll().then((events) => {
        return events.map(transformEvent);
    });
}

export function getLatestEvents(count) {
    return eventStorage.getLatest(count).then((events) => {
        return events.map(transformEvent);
    });
}
