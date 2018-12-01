import errorEventStorage from "../services/errorEvent/errorEventStorage";
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
            let query;
            let body;

            try {
                query = JSON.stringify(req.query);
            } catch (_err) {
                /**
                 * Probably will never happen, just to be safe.
                 */
                query = String(query);
            }

            try {
                body = JSON.stringify(req.body);
            } catch (_err) {
                /**
                 * Same here, just to be safe.
                 */
                body = String(body);
            }

            errorEventStorage.save({
                type: 500,
                user: req.user
                    ? { id: req.user.id, email: req.user.email }
                    : { id: -1, email: "" },
                data: err,
                stacktrace: err.stack ? err.stack : "",
                url: req.originalUrl,
                query: query,
                body: body,
            });
            res.status(500).json(
                errorMessage("An internal server error occurred", 500)
            );
        }
    }
};
