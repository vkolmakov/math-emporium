import eventStorage from "../services/eventStorage";
import { events } from "../aux";

function getAdditionalData(eventType, requestBody, additionalData) {
    switch (eventType) {
        case events.USER_CREATED_APPOINTMENT: {
            const { scheduledAppointmentId } = additionalData;
            return {
                appointment: {
                    id: scheduledAppointmentId,
                },
            };
        }
        case events.USER_REMOVED_APPOINTMENT: {
            const { removedAppointmentId } = additionalData;
            return {
                appointment: {
                    id: removedAppointmentId,
                },
            };
        }
        case events.USER_SIGNED_IN:
        default: {
            return {};
        }
    }
}

export default function createEventLogger(type) {
    return (req, additionalData = {}) => {
        const { user } = req;

        const userEmail = user.get("email");
        const userId = user.get("id");

        const event = {
            type,
            user: {
                id: userId,
                email: userEmail,
            },
            data: getAdditionalData(type, req.body, additionalData),
        };

        return eventStorage.save(event);
    };
}
