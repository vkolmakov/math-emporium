import { pickOneFrom, APPOINTMENT_LENGTH, R } from '../aux';
import { actionFailed } from '../services/errorMessages';
import { successMessage } from '../services/messages';

export default class ScheduledAppointmentsController {
    constructor(mainStorage, openSpotsService, cacheService, dateTime, helper) {
        this.mainStorage = mainStorage;
        this.openSpotsService = openSpotsService;
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
        const appointmentTime = this.dateTime.parse(appointmentData.time);

        const userAppointmentsPromise = this.mainStorage.db.models.scheduledAppointment.findAll({
            where: { userId: user.id, locationId: appointmentData.location.id, googleCalendarAppointmentDate: { $gt: now } },
        });
        const locationPromise = this.mainStorage.db.models.location.findOne({ where: { id: appointmentData.location.id } });
        const coursePromise = this.mainStorage.db.models.course.findOne({ where: { id: appointmentData.course.id, locationId: appointmentData.location.id } });
        const tutorDataPromise = this.openSpotsService.availableTutors(
            appointmentData.location,
            appointmentData.course,
            appointmentTime,
            this.dateTime.addMinutes(appointmentTime, APPOINTMENT_LENGTH)
        ).then((availableTutors) => {
            const wasExplicitlyRequested = !!appointmentData.tutor;
            const tutorRef = wasExplicitlyRequested
                  ? appointmentData.tutor
                  : pickOneFrom(availableTutors);
            const isSelectedTutorAvailable = !!tutorRef && availableTutors.map(R.prop('id')).includes(tutorRef.id);

            let result;
            if (isSelectedTutorAvailable) {
                result = this.mainStorage.db.models.tutor.findOne({ where: { id: tutorRef.id } })
                    .then((tutor) => ({ wasExplicitlyRequested, tutor }));
            } else {
                const rejectionReason = wasExplicitlyRequested
                      ? 'Requested tutor is no longer available'
                      : 'There are no more tutors available for this time slot';

                result = Promise.reject(rejectionReason);
            }

            return result;
        });

        return Promise.all([
            userAppointmentsPromise,
            locationPromise,
            coursePromise,
            tutorDataPromise,
        ]).then(([activeAppointmentsForUserAtLocation, location, course, tutorData]) => {
            const completeAppointmentData = {
                comments: appointmentData.comments,
                time: appointmentTime,
                location,
                subject: appointmentData.subject, // actually a subjectRef
                course,
                tutorData,
                user,
            };

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
