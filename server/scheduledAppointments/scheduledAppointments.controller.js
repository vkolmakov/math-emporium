import { events } from "../aux";
import { actionFailed } from "../services/errorMessages";
import { successMessage } from "../services/messages";
import { pluckPublicFields } from "./scheduledAppointments.model";

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
        const scheduleOrRejectAppointment = (
            activeAppointmentsForUser,
            completeAppointmentData,
            now,
        ) => {
            const {
                reason,
                canCreateAppointment,
            } = this.helper.canCreateAppointment(
                completeAppointmentData,
                activeAppointmentsForUser,
                now,
            );

            let result;
            if (canCreateAppointment) {
                result = this.helper.createAppointment(
                    completeAppointmentData,
                    now,
                );
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
            user,
            appointmentData,
            appointmentDateTime,
        );
        const activeAppointmentsForUserPromise = this.helper.getActiveAppointmentsForUser(
            user,
            appointmentData,
            now,
        );

        return Promise.all([
            completeAppointmentDataPromise,
            activeAppointmentsForUserPromise,
        ])
            .then(([completeAppointmentData, activeAppointmentsForUser]) => {
                const { location, subject, course } = completeAppointmentData;

                return scheduleOrRejectAppointment(
                    activeAppointmentsForUser,
                    completeAppointmentData,
                    now,
                ).then(() =>
                    Promise.all([
                        this.cacheService.calendarEvents.invalidate(
                            location.calendarId,
                        ),
                        this.helper.sendAppointmentCreationConfirmation(
                            completeAppointmentData,
                        ),
                        this.logger.log.createEvent(req),
                        user.setDefaultAppointmentPreferencesIfNoneSet(
                            location,
                            subject,
                            course,
                        ),
                    ]),
                );
            })
            .then(() => {
                res.status(200).json(successMessage());
            })
            .catch((reason) =>
                next(actionFailed("schedule", "appointment", reason)),
            );
    }

    delete(req, res, next) {
        const deletionRecord = {
            id: parseInt(req.params.id, 10),
        };
        const { user } = req;

        const now = this.dateTime.now();

        const appointmentWithLocationPromise = this.helper.getSingleActiveAppointmentWithLocation(
            user,
            deletionRecord,
            now,
        );

        return appointmentWithLocationPromise
            .then(({ appointment, location }) => {
                return this.helper
                    .deleteAppointment(appointment)
                    .then(() =>
                        Promise.all([
                            this.cacheService.calendarEvents.invalidate(
                                location.calendarId,
                            ),
                            this.helper.sendAppointmentDeletionConfirmation(
                                user,
                                appointment,
                                location,
                            ),
                            this.logger.log.deleteEvent(req),
                        ]),
                    );
            })
            .then(() => {
                res.status(200).json(successMessage());
            })
            .catch((reason) =>
                next(actionFailed("delete", "appointment", reason)),
            );
    }

    getForUser(req, res, next) {
        const { user } = req;
        const now = this.dateTime.now();

        return this.helper
            .getActiveAppointmentsForUser(user, now)
            .then((appointments) => {
                res.status(200).json(appointments.map(pluckPublicFields));
            })
            .catch(() => next(actionFailed("get", "appointments")));
    }

    getAllActiveAppointments(req, res, next) {
        const now = this.dateTime.now();

        const pluckRequiredFields = ({
            googleCalendarAppointmentDate,
            user,
            course,
            location,
        }) => ({
            time: googleCalendarAppointmentDate.toISOString(),
            user: user.email,
            course: course.code,
            location: location.name,
        });

        return this.helper
            .getAllActiveAppointmentsWithRelatedData(now)
            .then((appointments) => {
                res.status(200).json(appointments.map(pluckRequiredFields));
            })
            .catch(() => next(actionFailed("get", "appointments")));
    }
}
