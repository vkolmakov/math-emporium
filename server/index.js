import express from "express";
import bodyParser from "body-parser";
import helmet from "helmet";
import path from "path";

import session from "./middleware/session";
import errorHandler from "./middleware/errorHandler";
import serveCompressed from "./middleware/serveCompressed";

import createCrudRouter from "./routes/crudRouter";
import createAuthRouter from "./routes/authRouter";
import createUtilRouter from "./routes/utilRouter";
import createUserRouter from "./routes/userRouter";
import createScheduledAppointmentRouter from "./routes/scheduledAppointmentRouter";
import createManageUserRouter from "./routes/manageUserRouter";

import { connectToEventStorage } from "./services/eventStorage";
import settingsStorage from "./services/settings/settingsStorage";
import errorEventStorage from "./services/errorEvent/errorEventStorage";
import mainStorage from "./services/mainStorage";
import logger from "./services/logger";

import passportService from "./services/passport";
import morgan from "morgan";

import config from "./config";
import { CLI_OPTIONS } from "./constants";

function connectToEventStorageDatabase() {
    return connectToEventStorage(config.eventStorage.URL, {
        user: config.eventStorage.USER,
        password: config.eventStorage.PASSWORD,
    });
}

(async () => {
    try {
        await mainStorage.connect();
    } catch (err) {
        logger.log.error(`Could not connect to the main database: ${err}`);
    }

    try {
        await connectToEventStorageDatabase();
    } catch (err) {
        logger.log.error(
            `Could not connect to the event storage database: ${err}`
        );
    }

    try {
        await settingsStorage.connect(
            config.eventStorage.URL,
            {
                user: config.eventStorage.USER,
                password: config.eventStorage.PASSWORD,
            }
        );
    } catch (err) {
        logger.log.error(
            `Could not connect to the settings storage database: ${err}`
        );
    }

    try {
        await errorEventStorage.connect(
            config.eventStorage.URL,
            {
                user: config.eventStorage.USER,
                password: config.eventStorage.PASSWORD,
            }
        );
    } catch (err) {
        logger.log.error(
            `Could not connect to the error storage database: ${err}`
        );
    }

    const app = express();
    const port = config.PORT;

    const isProduction = config.IS_PRODUCTION;
    const isDevClient = !!process.argv.find(
        (a) => a === CLI_OPTIONS.DEV_CLIENT
    );

    if (isDevClient) {
        // allow mimetype sniffing for client-side development
        app.use(helmet({ noSniff: false }));
    } else {
        app.use(helmet());
    }

    app.use(bodyParser.json());
    app.use(session());
    app.use(passportService.middleware.initialize());

    if (!isProduction) {
        app.use(
            morgan("dev", {
                // ignore devtools discover requests
                skip: (req) => req.originalUrl.startsWith("/json"),
            })
        );
    }

    const crudRoutes = [
        ["locations"],
        ["courses"],
        ["tutors"],
        ["schedules"],
        ["subjects"],
    ];

    crudRoutes.forEach((routeParams) =>
        app.use("/api", createCrudRouter(...routeParams))
    );

    app.use("/api", createUserRouter());
    app.use("/api", createAuthRouter());
    app.use("/api", createUtilRouter());
    app.use("/api", createManageUserRouter());
    app.use("/api", createScheduledAppointmentRouter());

    app.use(errorHandler);

    if (isDevClient) {
        const webpack = require("webpack");
        const webpackConfig = require("../webpack.config");
        const webpackMiddleware = require("webpack-dev-middleware");
        const webpackHotMiddleware = require("webpack-hot-middleware");
        const compiler = webpack(webpackConfig);
        const middleware = webpackMiddleware(compiler, {
            publicPath: webpackConfig.output.publicPath,
            contentBase: "src",
            stats: {
                colors: true,
                hash: false,
                timings: true,
                chunks: false,
                chunkModules: false,
                modules: false,
            },
        });

        app.use(middleware);
        app.use(webpackHotMiddleware(compiler));
        app.get("*", (req, res) => {
            res.write(
                middleware.fileSystem.readFileSync(
                    path.join(__dirname, "../dist/index.html")
                )
            );
            res.end();
        });
    } else {
        app.get("*.js", serveCompressed);
        app.get("*.css", serveCompressed);

        app.use(express.static(path.join(__dirname, "../dist")));
        app.get("*", (req, res) =>
            res.sendFile(path.join(__dirname, "../dist/index.html"))
        );
    }

    app.listen(port, () => logger.log.info(`Running on port ${port}`));
})();
