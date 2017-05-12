export default {
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
        NAME: process.env.DB_NAME || 'mathcenterapp_dev',
        USER: process.env.DB_USER || 'postgres',
        PASSWORD: process.env.DB_PASSWORD || '',
        PORT: process.env.DB_PORT || null,
        HOST: process.env.DB_HOST || null,
    },
    google: {
        SERVICE_ACCOUNT: process.env.GOOGLE_SERVICE_ACCOUNT,
        SERVICE_KEY: process.env.GOOGLE_SERVICE_KEY,
    },
};
