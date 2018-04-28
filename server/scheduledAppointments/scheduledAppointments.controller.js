import { actionFailed } from '../services/errorMessages';
import { successMessage } from '../services/messages';

export default class ScheduledAppointmentsController {
    constructor(mainStorage, helper) {
        this.mainStorage = mainStorage;

        this.helper = helper || {
            getExistingActiveAppointments(appointments, now) {
                return [];
            },

            canCreateAppointment(existingAppointments, locations) {
                return {
                    canCreateAppointment: true,
                    reason: '',
                };
            },

            createAppointment(user, appointmentData) {
                return Promise.resolve();
            },
        };
    }


    create() {
        return (req, res, next) => {
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

            return Promise.all([userAppointmentsPromise, locationsPromise]).then(([userAppointments, locations]) => {
                const existingAppointments = this.helper.getExistingActiveAppointments(userAppointments, new Date());
                const { reason, canCreateAppointment } = this.helper.canCreateAppointment(existingAppointments, locations);

                let result;
                if (canCreateAppointment) {
                    result = this.helper.createAppointment(user, appointmentData);
                } else {
                    result = Promise.reject(reason);
                }

                return result;
            }).then(
                () => res.status(200).json(successMessage()),
                (reason) => next(actionFailed('schedule', 'appointment', reason)) // convert to error message
            );
        };
    }

    delete(req, res, next) {
        res.status(200).json('hello');
    }
}
