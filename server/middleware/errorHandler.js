import errorStorage from '../services/errorStorage';
import { errorMessage } from '../services/errorMessages';

export default (err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    switch (err.status) {
    case 404: res.status(err.status).json(err); break;
    case 422: res.status(err.status).json(err); break;
    default:
        errorStorage.save({
            type: 500,
            user: !!req.user.id ? { id: req.user.id, email: req.user.email } : { id: -1, email: '' },
            data: err,
            stacktrace: !!err.stack ? err.stack : '',
        });
        res.status(500).json(errorMessage('An internal server error occurred', 500));
    }
};
