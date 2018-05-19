import { APPOINTMENT_LENGTH } from '../aux';
import { actionFailed } from '../services/errorMessages';
import { successMessage } from '../services/messages';

export default class ScheduledAppointmentsController {
    constructor(cacheService, dateTime, helper) {
        this.cacheService = cacheService;
        this.dateTime = dateTime;
        this.helper = helper;
    }

    create(req, res, next) {
        const scheduleOrRejectAppointment = (activeAppointmentsForUserAtLocation, completeAppointmentData, now) => {
            const { reason, canCreateAppointment } = this.helper.canCreateAppointment(
                completeAppointmentData,
                activeAppointmentsForUserAtLocation,
                now
            );

            let result;
            if (canCreateAppointment) {
                result = this.helper.createAppointment(completeAppointmentData);
            } else {
                result = Promise.reject(reason);
            }

            return result;
        };

        const { user } = req;
        /**
         * {
         *     time: String (ISO),
         *     course: { id: Number },
         *     subject: { id: Number },
         *     location: { id: Number },
         *     tutor: { id: Number },
         *     comments: String,
         * }
         */
        const appointmentData = req.body;

        const now = this.dateTime.now();
        const appointmentDateTime = this.dateTime.parse(appointmentData.time);

        const completeAppointmentDataPromise = this.helper.gatherCompleteAppointmentData(
            user, appointmentData, appointmentDateTime);
        const activeAppointmentsForUserAtLocationPromise = this.helper.getActiveAppointmentsForUserAtLocation(
            user, appointmentData, now);

        return Promise.all([
            completeAppointmentDataPromise,
            activeAppointmentsForUserAtLocationPromise
        ]).then(([completeAppointmentData, activeAppointmentsForUserAtLocation]) => {
            const { location } = completeAppointmentData;

            return scheduleOrRejectAppointment(activeAppointmentsForUserAtLocation, completeAppointmentData, now)
                .then(() => this.cacheService.calendarEvents.invalidate(location.calendarId))
                .then(() => this.helper.sendAppointmentCreationConfirmation(completeAppointmentData));
        }).then(() => {
            res.status(200).json(successMessage());
        }).catch((reason) => next(actionFailed('schedule', 'appointment', reason)));
    }

    delete(req, res, next) {

        res.status(200).json('hello');
    }
}
