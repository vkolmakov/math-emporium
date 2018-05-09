import { dateTime } from '../aux';
import { actionFailed } from '../services/errorMessages';
import { successMessage } from '../services/messages';

export default class ScheduledAppointmentsController {
    constructor(mainStorage, helper) {
        this.mainStorage = mainStorage;
        this.helper = helper;
    }

    create(req, res, next) {
        const scheduleOrRejectAppointment = (userAppointments, locations, completeAppointmentData) => {
            const existingAppointments = this.helper.getExistingActiveAppointments(userAppointments, dateTime.now());
            const { reason, canCreateAppointment } = this.helper.canCreateAppointment(existingAppointments, locations);

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
        const userAppointmentsPromise = this.mainStorage.db.models.scheduledAppointment.findAll({
            where: { id: user.id },
        });
        const locationsPromise = this.mainStorage.db.models.location.findAll();

        const locationPromise = this.mainStorage.db.models.location.findOne({ where: { id: appointmentData.location.id } });
        const coursePromise = this.mainStorage.db.models.course.findOne({ where: { id: appointmentData.course.id } });
        const tutorPromise = this.mainStorage.db.models.tutor.findOne({ where: { id: appointmentData.tutor.id } });

        return Promise.all([
            userAppointmentsPromise,
            locationsPromise,
            locationPromise,
            coursePromise,
            tutorPromise,
        ]).then(([userAppointments, locations, location, course, tutor]) => {
            const completeAppointmentData = {
                comments: appointmentData.comments,
                time: dateTime.parse(appointmentData.time),
                location,
                course,
                tutor,
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
