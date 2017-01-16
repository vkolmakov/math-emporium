import express from 'express';
import db from 'sequelize-connect';
import bodyParser from 'body-parser';
import path from 'path';

import errorHandler from './middleware/errorHandler';
import serveCompressed from './middleware/serveCompressed';

import createCrudRouter from './routes/crudRouter';
import createAuthRouter from './routes/authRouter';
import createUtilRouter from './routes/utilRouter';
import createUserRouter from './routes/userRouter';
import createManageUserRouter from './routes/manageUserRouter';

import webpack from 'webpack';
import config from '../webpack.config';
import morgan from 'morgan';


function connect() {
    db.discover = path.join(__dirname);
    db.matcher = (file) => !!file.match(/.+\.model\.js/);

    return db.connect(process.env.DB_NAME || 'mathcenterapp_dev',
                      process.env.DB_USER || 'postgres',
                      process.env.DB_PASSWORD || '', {
                          dialect: 'postgres',
                          protocol: 'postgres',
                          port: process.env.DB_PORT || null,
                          host: process.env.DB_HOST || null,
                          logging: false,
                          dialectOptions: {
                              ssl: !!process.env.DB_NAME,
                          },
                      });
}

(async () => {
    try {
        await connect();
    } catch (err) {
        console.log(`Could not connect to the database: ${err}`);
    }

    const app = express();
    const port = process.env.PORT || 3000;

    const isDev = process.env.NODE_ENV !== 'production';
    if (isDev) {
        app.use(morgan('dev'));
    }

    app.use(bodyParser.json());

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

    const isDevClient = process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'serverdev';

    app.use(errorHandler);

    if (isDevClient) {
        const webpackMiddleware = require('webpack-dev-middleware');
        const webpackHotMiddleware = require('webpack-hot-middleware');
        const compiler = webpack(config);
        const middleware = webpackMiddleware(compiler, {
            publicPath: config.output.publicPath,
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
