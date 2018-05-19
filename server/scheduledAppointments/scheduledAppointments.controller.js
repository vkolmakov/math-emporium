import { events } from '../aux';
import { actionFailed } from '../services/errorMessages';
import { successMessage } from '../services/messages';

export default class ScheduledAppointmentsController {
    constructor(cacheService, dateTime, createEventLogger, helper) {
        this.cacheService = cacheService;
        this.dateTime = dateTime;
        this.logger = {
            log: {
                createEvent: createEventLogger(events.USER_CREATED_APPOINTMENT),
                deleteEvent: createEventLogger(events.USER_REMOVED_APPOINTMENT),
            },
        };
        this.helper = helper;
    }

    create(req, res, next) {
        const scheduleOrRejectAppointment = (activeAppointmentsForUserAtLocation, completeAppointmentData, now) => {
            const { reason, canCreateAppointment } = this.helper.canCreateAppointment(
                completeAppointmentData,
                activeAppointmentsForUserAtLocation,
                now,
            );

            let result;
            if (canCreateAppointment) {
                result = this.helper.createAppointment(completeAppointmentData, now);
            } else {
                result = Promise.reject(reason);
            }

            return result;
        };

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
        const { user } = req;

        const now = this.dateTime.now();
        const appointmentDateTime = this.dateTime.parse(appointmentData.time);

        const completeAppointmentDataPromise = this.helper.gatherCompleteAppointmentData(
            user, appointmentData, appointmentDateTime);
        const activeAppointmentsForUserAtLocationPromise = this.helper.getActiveAppointmentsForUserAtLocation(
            user, appointmentData, now);

        return Promise.all([
            completeAppointmentDataPromise,
            activeAppointmentsForUserAtLocationPromise,
        ]).then(([completeAppointmentData, activeAppointmentsForUserAtLocation]) => {
            const { location, subject, course } = completeAppointmentData;

            return scheduleOrRejectAppointment(activeAppointmentsForUserAtLocation, completeAppointmentData, now)
                .then(() => Promise.all([
                    this.cacheService.calendarEvents.invalidate(location.calendarId),
                    this.helper.sendAppointmentCreationConfirmation(completeAppointmentData),
                    this.logger.log.createEvent(req),
                    user.setDefaultAppointmentPreferencesIfNoneSet(location, subject, course),
                ]));
        }).then(() => {
            res.status(200).json(successMessage());
        }).catch((reason) => next(actionFailed('schedule', 'appointment', reason)));
    }

    delete(req, res, next) {
        /**
         * {
         *     id: Number,
         * }
         */
        const deletionRecord = req.body;
        const { user } = req;

        const now = this.dateTime.now();

        const appointmentWithLocationPromise = this.helper.getSingleActiveAppointmentWithLocation(user, deletionRecord, now);

        appointmentWithLocationPromise.then(({ appointment, location }) => {
            return this.helper.deleteAppointment(appointment)
                .then(() => Promise.all([
                    this.cacheService.calendarEvents.invalidate(location.calendarId),
                    this.helper.sendAppointmentDeletionConfirmation(user, appointment, location),
                    this.logger.log.deleteEvent(req),
                ]));
        }).then(() => {
            res.status(200).json(successMessage());
        }).catch((reason) => next(actionFailed('delete', 'appointment', reason)));
    }
}
