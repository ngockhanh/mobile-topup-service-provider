'use strict'

const crypto = require('crypto');
const path = require('path');
const fileSystem = require('fs');
const soap = require('soap');
const Log = require('timestamp-log');
const log = new Log(process.env.LOG_LEVEL);

var SuccessCodes = [0],
    FailCodes = [110, 103, 111, 15];

var getSign = function (payload) {
    var payloadValues = Object.values(payload);
    var sign = crypto.createSign('SHA1');
    var privateKey = getPrivateKey();

    sign.update(payloadValues.join(''), 'utf8');

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

var getTelcoByPhone = function (phoneNumber) {
    const telco = {
        'VTT': ['086', '096', '097', '098', '0162', '0163', '0164', '0165', '0166', '0167', '0168', '0169'],
        'VNP': ['091', '094', '0123', '0124', '0125', '0127', '0129', '088'],
        'VMS': ['090', '093', '0120', '0121', '0122', '0126', '0128', '089'],
        'VNM': ['092', '0188', '0186'],
        'BEE': ['099', '0199']
    };

    var telcoCodes = Object.keys(telco);
    var firstThreeNum = phoneNumber.toString().substr(0, 3);
    var firstFourNum = phoneNumber.toString().substr(0, 4);

    for (var i = 0; i < telcoCodes.length; i++) {
        var code = telcoCodes[i];
        if (telco[code].indexOf(firstThreeNum) >= 0 || telco[code].indexOf(firstFourNum)) {
            return code;
        }
    }
};
var sendRequest = function (requestId, phoneNumber, amount, callback) {
    try {
        var payload = {
            requestId: requestId,
            partnerName: process.env.TOPUP_SERVICE_PARTNER_NAME,
            provider: getTelcoByPhone(phoneNumber),
            target: phoneNumber,
            amount: amount
        };

        payload['sign'] = getSign(payload);

        soap.createClientAsync(process.env.TOPUP_SERVICE_URL)
            .then(function (client) {
                client.topupAsync(payload)
                    .then(function (result) {
                        var code = result.topupReturn.errorCode['$value'];
                        var status = 'PENDING';

                        if (SuccessCodes.indexOf(code) >= 0) {
                            status = 'SUCCESS';
                        }

                        if (FailCodes.indexOf(code) >= 0) {
                            status = 'FAIL';
                        }

                        callback(null, {
                            status: status,
                            request_id: requestId
                        });

                        log.debug('VNPTEPAY: ', result);
                    })
                    .catch(function (err) {
                        callback({
                            code: 'FAIL',
                            message: 'An error has occurred'
                        });

                        log.error('VNPTEPAY: ', err);
                    });
            })
            .catch(function (e) {
                callback({
                    code: 'FAIL',
                    message: 'An error has occurred'
                });

                log.error('VNPTEPAY: ', e);
            });
    } catch (e) {
        callback({
            code: 'FAIL',
            message: 'An error has occurred'
        });

        log.error('VNPTEPAY: ', e);
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
                        var code = result.checkTransReturn.errorCode['$value'];
                        var status = 'PENDING';

                        if (SuccessCodes.indexOf(code) >= 0) {
                            status = 'SUCCESS';
                        }

                        if (FailCodes.indexOf(code) >= 0) {
                            status = 'FAIL';
                        }

                        callback(null, {
                            status: status,
                            request_id: requestId
                        });

                        log.debug('VNPTEPAY: ', result);
                    })
                    .catch(function (err) {
                        callback({
                            code: 'FAIL',
                            message: 'An error has occurred'
                        });

                        log.error('VNPTEPAY: ', err);
                    });
            })
            .catch(function (e) {
                callback({
                    code: 'FAIL',
                    message: 'An error has occurred'
                });

                log.error('VNPTEPAY: ', e);
            });

    } catch (e) {
        callback({
            code: 'FAIL',
            message: 'An error has occurred'
        });

        log.error('VNPTEPAY: ', e);
    }
};


module.exports = {
    createOrder: function (object, callback) {
        sendRequest(object.request_id, object.phone_number, object.amount, callback);
    },

    queryOrder: function (requestId, callback) {
        checkRequest(requestId, callback);
    }
};