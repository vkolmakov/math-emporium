export default {
    log: {
        error(...args) {
            console.error(...args); // eslint-disable-line no-console
        },

        debug(...args) {
            console.log(...args); // eslint-disable-line no-console
        },

        info(...args) {
            console.log(...args); // eslint-disable-line no-console
        },
    },
};
