const onFinished = require('on-finished');
const {
    Counter,
    Registry
} = require('prom-client');

const registry = new Registry();
const responseCounter = new Counter({
    name: 'core_requests_total',
    help: 'Amount of total HTTP requests',
    labelNames: ['status', 'endpoint', 'method', 'path'],
    registers: [registry]
});

const mailsCounter = new Counter({
    name: 'mailer_mails_sent_total',
    help: 'Amount of total mails sent',
    registers: [registry]
});

exports.increaseMailsCounter = async () => {
    mailsCounter.inc();
};

exports.addEndpointMetrics = async (req, res, next) => {
    const callbackOnFinished = () => {
        const endpoint = req.baseUrl + req.path;

        // ignoring healthchecks and metrics requests
        if (endpoint.startsWith('/healthcheck') || endpoint.startsWith('/metrics')) {
            return;
        }

        const labelsObject = {
            endpoint,
            status: res.statusCode,
            path: req.originalUrl,
            method: req.method
        };

        responseCounter.inc(labelsObject);
    };

    req.startTime = Date.now();

    onFinished(res, callbackOnFinished);
    return next();
};

exports.getMetrics = async (req, res) => {
    res.set('Content-Type', registry.contentType);
    res.end(registry.metrics());
};
