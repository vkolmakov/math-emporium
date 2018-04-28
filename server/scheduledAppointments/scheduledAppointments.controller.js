export default class ScheduledAppointmentsController {
    constructor(mainStorage) {
        this.mainStorage = mainStorage;
    }

    create(req, res, next) {
        const { user } = req;

        res.status(200).json('hello');
    }

    delete(req, res, next) {
        res.status(200).json('hello');
    }
}
