const { NODE_ENV_VALUE, PRODUCTION_EMAIL_PROVIDER } = require("./constants");

const timeUnits = {
    minutes: (n) => n * 60 * 1000,
    hours: (n) => timeUnits.minutes(60 * n),
    days: (n) => timeUnits.hours(24 * n),
};

function getSessionLength(rawSessionLength) {
    const DEFAULT_SESSION_LENGTH = timeUnits.days(7);
    const sessionLength = parseInt(rawSessionLength, 10);

    return !isNaN(sessionLength) ? sessionLength : DEFAULT_SESSION_LENGTH;
}

module.exports = {
    HOSTNAME: process.env.HOSTNAME || "http://localhost:3000",
    IS_PRODUCTION: process.env.NODE_ENV === NODE_ENV_VALUE.PRODUCTION,
    PORT: process.env.PORT || 3000,
    SECRET: process.env.SECRET || "this is supersecret",
    SESSION_LENGTH: getSessionLength(process.env.SESSION_LENGTH),
    email: {
        PROVIDER:
            process.env.EMAIL_PROVIDER || PRODUCTION_EMAIL_PROVIDER.MAILGUN,
        // Not required - was used for sending emails before Sparkpost
        // changed their free plan limits to include less than 500 emails.
        SPARKPOST_API_KEY: process.env.EMAIL_SPARKPOST_API_KEY,
        MAILGUN_API_KEY: process.env.EMAIL_MAILGUN_API_KEY,
        // NOTE: domain of the provided email address must be registered with
        // the respective email service provider.
        ADDRESS: process.env.EMAIL_ADDRESS,
        NAME: process.env.EMAIL_NAME,
    },
    db: {
        NAME:
            process.env.DB_NAME || `mathcenterapp_main_${process.env.NODE_ENV}`,
        USER: process.env.DB_USER || "postgres",
        PASSWORD: process.env.DB_PASSWORD || "",
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
        URL:
            process.env.EVENTSTORAGE_URL ||
            `mongodb://localhost/mathcenterapp_eventstorage_${
                process.env.NODE_ENV
            }`,
        USER: process.env.EVENTSTORAGE_USER || null,
        PASSWORD: process.env.EVENTSTORAGE_PASSWORD || null,
    },
    redis: {
        URL: process.env.REDIS_URL || "",
        DB_NUMBER: {
            SESSION: 1,
        },
    },
};
