import { dateTime, pickOneFrom, APPOINTMENT_LENGTH, R } from '../aux';
import { actionFailed } from '../services/errorMessages';
import { successMessage } from '../services/messages';

import * as openSpotsService from '../services/openSpots/openSpots.service';

export default class ScheduledAppointmentsController {
    constructor(mainStorage, helper) {
        this.mainStorage = mainStorage;
        this.helper = helper;
    }

    create(req, res, next) {
        const scheduleOrRejectAppointment = (userAppointments, locations, completeAppointmentData) => {
            const now = dateTime.now();
            const existingAppointments = this.helper.getExistingActiveAppointments(userAppointments, now);
            const { reason, canCreateAppointment } = this.helper.canCreateAppointment(
                completeAppointmentData,
                existingAppointments,
                locations,
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

        const sendEmailConfirmation = (completeAppointmentData) => {
            return this.helper.sendAppointmentCreationConfirmation(completeAppointmentData);
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

        const appointmentTime = dateTime.parse(appointmentData.time);

        const userAppointmentsPromise = this.mainStorage.db.models.scheduledAppointment.findAll({ where: { id: user.id } });
        const locationsPromise = this.mainStorage.db.models.location.findAll();
        const locationPromise = this.mainStorage.db.models.location.findOne({ where: { id: appointmentData.location.id } });
        const coursePromise = this.mainStorage.db.models.course.findOne({ where: { id: appointmentData.course.id } });
        const tutorDataPromise = openSpotsService.availableTutors(
            appointmentData.location,
            appointmentData.course,
            appointmentTime,
            dateTime.addMinutes(appointmentTime, APPOINTMENT_LENGTH)
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
            locationsPromise,
            locationPromise,
            coursePromise,
            tutorDataPromise,
        ]).then(([userAppointments, locations, location, course, tutorData]) => {
            const completeAppointmentData = {
                comments: appointmentData.comments,
                time: appointmentTime,
                location,
                subject: appointmentData.subject, // actually a subjectRef
                course,
                tutorData,
                user,
            };

            return scheduleOrRejectAppointment(userAppointments, locations, completeAppointmentData)
                .then(() => sendEmailConfirmation(completeAppointmentData));
        }).then(() => {
            res.status(200).json(successMessage());
        }).catch((reason) => next(actionFailed('schedule', 'appointment', reason)));
    }

    delete(req, res, next) {
        res.status(200).json('hello');
    }
}
