/* eslint-disable no-console */
import path from 'path';
import db from 'sequelize-connect';

import { authGroups } from '../aux';
import config from '../config';

function panic(message) {
    console.error(`ERROR: ${message}`);
    process.exit(1);
}

function connect() {
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
}

function makeAdmin(userEmail) {
    const User = db.models.user;

    User.findOne({ where: { email: userEmail } })
        .then(user => {
            if (!user) {
                throw new Error(`User ${userEmail} does not exist. Make sure to create this user first.`);
            }

            user.group = authGroups.ADMIN; // eslint-disable-line no-param-reassign
            return user.save();
        })
        .then(() => {
            console.log(`User ${userEmail} was granted admin rights.`);
        })
        .catch(panic);
}

const email = process.argv[2];

if (!email) {
    panic('Admin user email must be passed in as a first parameter.');
}

connect().then(() => makeAdmin(email));
