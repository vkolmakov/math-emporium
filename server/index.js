import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';

import errorHandler from './middleware/errorHandler';
import serveCompressed from './middleware/serveCompressed';

import createCrudRouter from './routes/crudRouter';
import createAuthRouter from './routes/authRouter';
import createUtilRouter from './routes/utilRouter';
import createUserRouter from './routes/userRouter';
import createManageUserRouter from './routes/manageUserRouter';

import { connectToEventStorage } from './services/eventStorage';
import mainStorage from './services/mainStorage';

import webpack from 'webpack';
import webpackConfig from '../webpack.config';
import morgan from 'morgan';

import config from './config';


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
        console.error(`Could not connect to the main database: ${err}`);
    }

    try {
        await connectToEventStorageDatabase();
    } catch (err) {
        console.error(`Could not connect to the event storage database: ${err}`);
    }

    const app = express();
    const port = config.PORT;

    const isProduction = config.IS_PRODUCTION;

    app.use(bodyParser.json());
    if (!isProduction) {
        app.use(morgan('dev', {
            // ignore devtools discover requests
            skip: (req, res) => req.originalUrl.startsWith('/json'),
        }));
    }

    const crudRoutes = [
        ['locations'],
        ['courses'],
        ['tutors'],
        ['schedules'],
    ];

    crudRoutes.forEach((routeParams) => app.use('/api', createCrudRouter(...routeParams)));

    app.use('/api', createUserRouter());
    app.use('/api', createAuthRouter());
    app.use('/api', createUtilRouter());
    app.use('/api', createManageUserRouter());

    app.use(errorHandler);

    const isDevClient = !isProduction && process.env.NODE_ENV !== 'serverdev';
    if (isDevClient) {
        const webpackMiddleware = require('webpack-dev-middleware');
        const webpackHotMiddleware = require('webpack-hot-middleware');
        const compiler = webpack(webpackConfig);
        const middleware = webpackMiddleware(compiler, {
            publicPath: webpackConfig.output.publicPath,
            contentBase: 'src',
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
        app.get('*', (req, res) => {
            res.write(middleware.fileSystem.readFileSync(path.join(__dirname, '../dist/index.html')));
            res.end();
        });
    } else {
        app.get('*.js', serveCompressed);
        app.get('*.css', serveCompressed);

        app.use(express.static(path.join(__dirname, '../dist')));
        app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../dist/index.html')));
    }
    app.listen(port, () => console.log(`Running on port ${port}`));
})();
