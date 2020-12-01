const merge = require('../lib/merge');

const config = {
    default: {
        port: 8084,
        logger: {
            silent: false,
            level: process.env.LOGLEVEL || 'debug'
        },
        host: process.env.HOST || 'localhost',
        filter_fields: [
            'token',
            'password',
            'bugsnag_key',
            'cookie',
            'pass'
        ],
        bugsnag_key: process.env.BUGSNAG_KEY_CORE || 'CHANGEME'
    },
    development: {

    },
    test: {
        port: 8085,
        logger: {
            silent: (typeof process.env.ENABLE_LOGGING !== 'undefined') ? (!process.env.ENABLE_LOGGING) : true
        }
    }
};

// Assuming by default that we run in 'development' environment, if no
// NODE_ENV is specified.
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
const env = process.env.NODE_ENV;


// The config.json file can contain a 'default' field and some environment
// fields. (e.g. 'development'). The 'default' field is loaded first, if exists,
// and then its fields are overwritten by the environment field, if exists.
// If both 'default' and environment fields are missing, than there's no config
// and we throw an error.
if (!config[env] && !config.default) {
    throw new Error(`Both 'default' and '${process.env.NODE_ENV}' are not set in config/index.js; \
cannot run without config.`);
}

// If we have the default config, set it first.
let appConfig = config.default || {};

// If we have the environment config, overwrite the config's fields with its fields
if (config[env]) {
    appConfig = merge(appConfig, config[env]);
}

module.exports = appConfig;
