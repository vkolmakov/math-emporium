import express from 'express';
import db from 'sequelize-connect';
import bodyParser from 'body-parser';
import path from 'path';
import compression from 'compression';
import morgan from 'morgan';

import createCrudRouter from './crudRouter';
import createAuthRouter from './authRouter';

import webpack from 'webpack';
import webpackMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import config from '../webpack.config';

function connect() {
    db.discover = path.join(__dirname);
    db.matcher = (file) => !!file.match(/.+\.model\.js/);

    return db.connect('mathcenterappdb', 'postgres', '', {
        force: false,
        // logging: false,
        dialect: 'postgres',
    });
}

(async () => {
    try {
        await connect();
    } catch (err) {
        console.log(`Could not connect to the database: ${err}`);
    }

    const app = express();
    const port = 3000;

    app.use(bodyParser.json());
    app.use(morgan('default', {}));

    const crudRoutes = [
        ['locations', 'private'],
        ['courses', 'private'],
        ['tutors', 'private'],
        ['schedules', 'private'],
    ];

    crudRoutes.forEach((routeParams) => app.use('/api', createCrudRouter(...routeParams)));
    app.use('/api', createAuthRouter());

    const isDev = process.env.NODE_ENV !== 'production';

    if (isDev) {
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
        app.use(compression());
        app.use(express.static(path.join(__dirname, '../dist')));
        app.get('*', (req, res) => {
            res.sendFile(path.join(__dirname, '../dist/index.html'));
        });
    }
    app.listen(port, () => console.log(`Running on port ${port}`));
})();
