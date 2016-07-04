import express from 'express';
import db from 'sequelize-connect';
import bodyParser from 'body-parser';
import path from 'path';
import compression from 'compression';
import morgan from 'morgan';

import createCrudRouter from './routes/crudRouter';
import createAuthRouter from './routes/authRouter';

import webpack from 'webpack';
import config from '../webpack.config';

function connect() {
    db.discover = path.join(__dirname);
    db.matcher = (file) => !!file.match(/.+\.model\.js/);

    return db.connect(process.env.DATABASE_URL || 'mathcenterappdb', 'postgres', '', {
        logging: false,
        dialect: 'postgres',
        protocol: 'postgres',
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
        app.use(compression());
        app.use(express.static(path.join(__dirname, '../dist')));
        app.get('*', (req, res) => {
            res.sendFile(path.join(__dirname, '../dist/index.html'));
        });
    }
    app.listen(port, () => console.log(`Running on port ${port}`));
})();
