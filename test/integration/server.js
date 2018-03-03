const { spawn } = require('child_process');
const fs = require('fs');

const LOG_FILE = './intergration-test-server.log';
const SERVER_STARTED_MESSAGE = 'running on port';

const server = {
    _serverProcessPid: null,

    setup() {
        return new Promise((resolve) => {
            const logOutput = fs.openSync(LOG_FILE, 'a');

            const process = spawn('npm', ['run', 'start'], {
                detached: true,
            });

            server._serverProcessPid = process.pid;

            process.stdout.on('data', (data) => {
                const output = data.toString('utf8').toLowerCase();
                if (output.includes(SERVER_STARTED_MESSAGE)) {
                    // redirect output
                    process.stdout = logOutput;
                    process.stderr = logOutput;

                    // let go of the process
                    process.unref();
                    resolve(server);
                }
            });
        });
    },

    teardown() {
        return Promise.resolve(process.kill(server._serverProcessPid, 'SIGTERM'));
    },
};

module.exports = server;
