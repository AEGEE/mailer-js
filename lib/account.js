const nodemailer = require('nodemailer');

const logger = require('./logger');

class Account {
    constructor() {
        this.env = process.env.NODE_ENV || 'development';
        this.isTest = this.env !== 'production';
    }

    async createAccount() {
        this.account = (this.env === 'production')
            ? await this.getProdAccount()
            : await this.getTestAccount();
    }

    async getTestAccount() {
        logger.debug('Creating test account....');
        return await nodemailer.createTestAccount();
    }

    async getProdAccount() {
        logger.debug('Creating prod account....');
        return nodemailer.createTransport({
            host: 'mail-transfer-agent',
            port: 25
        });
    }
}

module.exports = new Account();
