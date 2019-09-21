import logger from "../services/logger";
import { errorMessage } from "../services/errorMessages";

export default (err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    switch (err.status) {
        case 404: {
            res.status(err.status).json(err);
            break;
        }
        case 422: {
            res.status(err.status).json(err);
            break;
        }
        default: {
            logger.log.requestError(req, err);
            res.status(500).json(
                errorMessage("An internal server error occurred", 500)
            );
        }
    }
};
