import errorEventStorage from "./errorEvent/errorEventStorage";

export default {
    log: {
        error(...args) {
            console.error(...args); // eslint-disable-line no-console
        },

        requestError(req, err) {
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

            const isAxiosNetworkRequestError =
                err.config && err.headers && err.request && err.status;

            const errorEvent = {
                // TODO: also store HTTP method.
                type: 500,
                user: req.user
                    ? { id: req.user.id, email: req.user.email }
                    : { id: -1, email: "" },
                data: isAxiosNetworkRequestError
                    ? {
                          url: err.config.url,
                          status: err.status,
                          config: err.config,
                      }
                    : err,
                stacktrace: err.stack ? err.stack : "",
                url: req.originalUrl,
                query: query,
                body: body,
            };

            return errorEventStorage.save(errorEvent).catch((err) => {
                // In case store is not reachable or the serialization failed
                console.error(err);
            });
        },

        debug(...args) {
            console.log(...args); // eslint-disable-line no-console
        },

        info(...args) {
            console.log(...args); // eslint-disable-line no-console
        },
    },
};
