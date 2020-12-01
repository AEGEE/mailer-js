const morgan = require('morgan');
const _ = require('lodash');

const log = require('./logger');

module.exports = morgan((tokens, req, res) => {
    const body = _.isEmpty(req.body)
        ? undefined
        : req.body;

    log.info({
        method: tokens.method(req, res),
        url: tokens.url(req, res),
        status: tokens.status(req, res),
        length: tokens.res(req, res, 'content-length'),
        'response-time': tokens['response-time'](req, res),
        headers: req.headers,
        body
    }, 'Request processed');
});
