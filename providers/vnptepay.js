'use strict'

const crypto = require('crypto');
const path = require('path');
const fileSystem = require('fs');
const soap = require('soap');
const Log = require('timestamp-log');
const log = new Log(process.env.LOG_LEVEL);

var getSign = function (payload) {
    var payloadValues = Object.values(payload);
    var sign = crypto.createSign('SHA1');
    var privateKey = getPrivateKey();

    sign.update(payloadValues.join(''));

    return sign.sign(privateKey, 'base64');
};

var getPrivateKey = function () {
    var appRootPath = require('app-root-path');
    var privateKeyPath = path.join(appRootPath.toString(), process.env.TOPUP_SERVICE_SECURE_PRIVATE_KEY);

    if (fileSystem.existsSync(privateKeyPath)) {
        var content = fileSystem.readFileSync(privateKeyPath, 'utf8');

        if (content.length == 0) {
            throw new Error('Private key invalid');
        }

        return content;
    }

    throw new Error('Private key is not found');
};

var sendRequest = function (requestId, phoneNumber, amount, provider, callback) {
    try {
        var payload = {
            requestId: requestId,
            partnerName: process.env.TOPUP_SERVICE_PARTNER_NAME,
            provider: provider,
            target: phoneNumber,
            amount: amount
        };

        payload['sign'] = getSign(payload);

        soap.createClientAsync(process.env.TOPUP_SERVICE_URL)
            .then(function (client) {
                client.topupAsync(payload)
                    .then(function (result) {
                        callback(null, {
                            code: result.topupReturn.errorCode['$value'],
                            message: result.topupReturn.message['$value'],
                            request_id: requestId
                        });

                        log.debug(result);
                    })
                    .catch(function (err) {
                        callback({
                            code: 'error-create-order-request',
                            message: 'VNPTEPAY: ' + err.message.toString()
                        });

                        log.error(err);
                    });
            })
            .catch(function (e) {
                callback({
                    code: 'error-create-order-request',
                    message: 'VNPTEPAY: ' + e.message.toString()
                });

                log.error(e);
            });
    } catch (e) {
        callback({
            code: 'error-create-order-request',
            message: 'VNPTEPAY: ' + e.message.toString()
        });

        log.error(e);
    }
};

var checkRequest = function (requestId, callback) {
    try {
        var payload = {
            requestId: requestId,
            partnerName: process.env.TOPUP_SERVICE_PARTNER_NAME,
            type: 1
        };

        var sign = getSign(payload);
        payload['sign'] = sign;

        soap.createClientAsync(process.env.TOPUP_SERVICE_URL)
            .then(function (client) {
                client.checkTransAsync(payload)
                    .then(function (result) {
                        callback(null, {
                            code: result.checkTransReturn.errorCode['$value'],
                            message: result.checkTransReturn.message['$value'],
                            request_id: requestId
                        });

                        log.debug(result);
                    })
                    .catch(function (err) {
                        callback({
                            code: 'error-check-order-request',
                            message: 'VNPTEPAY: ' + err.message.toString()
                        });

                        log.error(e);
                    });
            })
            .catch(function (e) {
                callback({
                    code: 'error-check-order-request',
                    message: 'VNPTEPAY: ' + e.message.toString()
                });

                log.error(e);
            });

    } catch (e) {
        callback({
            code: 'error-check-order-request',
            message: 'VNPTEPAY: ' + e.message.toString()
        });

        log.error(e);
    }
};


module.exports = {
    createOrder: function (object, callback) {
        sendRequest(object.request_id, object.phone_number, object.amount, object.provider, callback);
    },

    queryOrder: function (requestId, callback) {
        checkRequest(requestId, callback);
    }
};