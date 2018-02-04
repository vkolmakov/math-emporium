module.exports = {
    HOSTNAME: process.env.HOSTNAME || 'http://localhost:3000',
    IS_PRODUCTION: process.env.NODE_ENV === 'production',
    PORT: process.env.PORT || 3000,
    SECRET: process.env.SECRET || 'this is supersecret',
    email: {
        SPARKPOST_API_KEY: process.env.EMAIL_SPARKPOST_API_KEY,
        ADDRESS: process.env.EMAIL_ADDRESS,
        NAME: process.env.EMAIL_NAME,
    },
    db: {
        NAME: process.env.DB_NAME || 'mathcenterapp_main_dev',
        USER: process.env.DB_USER || 'postgres',
        PASSWORD: process.env.DB_PASSWORD || '',
        PORT: process.env.DB_PORT || null,
        HOST: process.env.DB_HOST || null,
    },
    google: {
        SERVICE_ACCOUNT: process.env.GOOGLE_SERVICE_ACCOUNT,
        SERVICE_KEY: process.env.GOOGLE_SERVICE_KEY,
    },
    azure: {
        SECRET: process.env.AZURE_SECRET,
        CLIENT_ID: process.env.AZURE_CLIENT_ID,
        CALLBACK: process.env.AZURE_CALLBACK,
    },
    eventStorage: {
        URL: process.env.EVENTSTORAGE_URL || 'mongodb://localhost/mathcenterapp_eventstorage_dev',
        USER: process.env.EVENTSTORAGE_USER || null,
        PASSWORD: process.env.EVENTSTORAGE_PASSWORD || null,
    },
    redis: {
        URL: process.env.REDIS_URL || '',
    },
};
