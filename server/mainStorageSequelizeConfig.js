// Sequelize CLI wants a separate file for a config
// which is the main reason why this file exists
// the actual values are already configured in config.js

const config = require('./config');

const mainStorageSequelizeConfig = {
    username: config.db.USER,
    password: config.db.PASSWORD,
    database: config.db.NAME,
    host: config.db.HOST,
    port: config.db.PORT,
    dialect: 'postgres',
    protocol: 'postgres',
    logging: false,
    dialectOptions: {
        ssl: config.IS_PRODUCTION,
    },
};

// here it is
module.exports = {
    [process.env.NODE_ENV]: mainStorageSequelizeConfig,
};
