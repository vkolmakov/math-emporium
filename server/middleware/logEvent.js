import eventStorage from '../services/eventStorage';
import { events } from '../aux';

function getAdditionalData(eventType, requestBody) {
    switch (eventType) {
    case events.USER_CREATED_APPOINTMENT:
        const { location, course, time } = requestBody;
        return {
            time,
            course: {
                code: course.code,
                id: course.id,
            },
            location: {
                name: location.name,
                id: location.id,
            },
        };
    case events.USER_REMOVED_APPOINTMENT:
        return {};
    default:
        return {};
    }
}

export default function logEvent(type) {
    return (req, res, next) => {
        const { user } = req;

        const userEmail = user.get('email');
        const userId = user.get('id');

        const event = {
            type,
            user: {
                id: userId,
                email: userEmail,
            },
            data: getAdditionalData(type, req.body),
        };

        eventStorage.save(event);

        next();
    };
}
