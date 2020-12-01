const express = require('express');
const bodyParser = require('body-parser');
const boolParser = require('express-query-boolean');

const morgan = require('./morgan');
const log = require('./logger');
const account = require('./account');
const config = require('../config');
const Bugsnag = require('./bugsnag');

const middlewares = require('../middlewares/generic');
const metrics = require('../middlewares/metrics');

const server = express();
server.use(bodyParser.json());
server.use(morgan);
server.use(boolParser());
server.use(metrics.addEndpointMetrics);

server.get('/healthcheck', middlewares.healthcheck);
server.get('/metrics', metrics.getMetrics);
server.use(middlewares.notFound);
server.use(middlewares.errorHandler);

let app;
async function startServer() {
    return new Promise((res, rej) => {
        log.info({ config }, 'Starting server with the following config');
        const localApp = server.listen(config.port, async () => {
            app = localApp;
            await account.createAccount();
            log.info({
                account: account.account
            }, 'Mail account is successfully set up.');
            log.info({ host: 'http://localhost:' + config.port }, 'Up and running, listening');
            return res();
        });
        /* istanbul ignore next */
        localApp.on('error', (err) => rej(new Error('Error starting server: ' + err.stack)));
    });
}

async function stopServer() {
    log.info('Stopping server...');
    app.close();
    /* istanbul ignore next */
    app = null;
}

/* istanbul ignore next */
process.on('unhandledRejection', (err) => {
    log.error('Unhandled rejection: ', err);

    if (process.env.NODE_ENV !== 'test') {
        Bugsnag.notify(err);
    }
});

module.exports = {
    app,
    server,
    stopServer,
    startServer
};
