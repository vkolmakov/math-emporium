import { errorMessage } from '../services/errorMessages';

export default (err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    console.error(err);

    switch (err.status) {
    case 404: res.status(err.status).json(err); break;
    case 422: res.status(err.status).json(err); break;
    default: res.status(500).json(errorMessage('An internal server error occurred', 500)); break;
    }
};
