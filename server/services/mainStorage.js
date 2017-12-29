import path from 'path';
import db from 'sequelize-connect';

import config from '../config';

export default {
    db,
    connect() {
        db.discover = path.resolve(__dirname, '..');
        db.matcher = (file) => !!file.match(/.+\.model\.js/);

        return db.connect(config.db.NAME,
                          config.db.USER,
                          config.db.PASSWORD, {
                              dialect: 'postgres',
                              protocol: 'postgres',
                              port: config.db.PORT,
                              host: config.db.HOST,
                              logging: false,
                              dialectOptions: {
                                  ssl: config.IS_PRODUCTION,
                              },
                          });
    },
};
