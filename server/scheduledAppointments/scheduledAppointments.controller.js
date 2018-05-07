import { actionFailed } from '../services/errorMessages';
import { successMessage } from '../services/messages';

export default class ScheduledAppointmentsController {
    constructor(mainStorage, helper) {
        this.mainStorage = mainStorage;
        this.helper = helper;
    }

    create(req, res, next) {
        const { user } = req;
        /**
         * {
         *     time: Date,
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
            const existingAppointments = this.helper.getExistingActiveAppointments(userAppointments, new Date());
            const { reason, canCreateAppointment } = this.helper.canCreateAppointment(existingAppointments, locations);

            let result;
            if (canCreateAppointment) {
                const completeAppointmentData = {
                    ...appointmentData,
                    location,
                    course,
                    tutor,
                };

                result = this.helper.createAppointment(user, completeAppointmentData);
            } else {
                result = Promise.reject(reason);
            }

            return result;
        }).then(
            () => res.status(200).json(successMessage()),
            (reason) => next(actionFailed('schedule', 'appointment', reason)) // convert to error message
        );
    }

    delete(req, res, next) {
        res.status(200).json('hello');
    }
}
