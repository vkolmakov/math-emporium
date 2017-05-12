export default {
    HOSTNAME: process.env.HOSTNAME || 'http://localhost:3000',
    email: {
        SPARKPOST_API_KEY: process.env.EMAIL_SPARKPOST_API_KEY,
        ADDRESS: process.env.EMAIL_ADDRESS,
        NAME: process.env.EMAIL_NAME,
    },
};
