'use strict';

const Log = require('timestamp-log');
const log = new Log(process.env.LOG_LEVEL);
const topupProvider = require('./providers/' + process.env.TOPUP_SERVICE_PROVIDER.toLowerCase());

function CollectorHandler() {
    this.listeners = [];
    this.consumer = {
        commit: function (callback) {
            callback(null, {});
        }
    };
}

CollectorHandler.prototype.sendRequestToServiceProvider = function (object, callback) {
    if (process.env.TOPUP_SERVICE_ENABLED === 'YES' && object) {
        log.debug('sendRequestToServiceProvider:', object);
        topupProvider.createOrder(object, callback);
    } else {
        log.debug('sendRequestToServiceProvider:', response);
    }
};

CollectorHandler.prototype.sendCheckingRequestToServiceProvider = function (requestId, callback) {
    if (process.env.TOPUP_SERVICE_ENABLED === 'YES' && requestId) {
        log.debug('sendCheckingRequestToServiceProvider:', requestId);
        topupProvider.queryOrder(requestId, callback);
    } else {
        log.debug('sendCheckingRequestToServiceProvider:', response);
    }
};

module.exports = function () {
    return new CollectorHandler();
};