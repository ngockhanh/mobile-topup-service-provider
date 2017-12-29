'use strict'

const requestPromise = require('request-promise');
const Log = require('timestamp-log');
const log = new Log(process.env.LOG_LEVEL);
const crypto = require('crypto');

const SuccessCodes = [0],
    FailCodes = [-1, 5, 101, 102, 103, 104, 105];

var des_ecb_encrypt = function (params) {
    var key = params.key,
        iv = new Buffer(params.iv ? params.iv : 0),
        plainText = params.plaintext,
        alg = params.alg,
        autoPad = params.autopad;

    //encrypt
    var encrypt = crypto.createCipheriv(alg, key, iv);
    encrypt.setAutoPadding(autoPad);
    var theCipher = encrypt.update(plainText, 'utf8', params.outputType || 'hex');
    theCipher += encrypt.final(params.outputType || 'hex');

    return theCipher;
};

var getCheckSum = function (payload) {
    var payloadValues = Object.values(payload);
    payloadValues.push(process.env.TOPUP_SERVICE_SECURE_HASH_KEY);

    var sha1 = crypto.createHash('sha1');
    sha1.update(payloadValues.join(''), 'utf8');

    return sha1.digest('base64');
};

var hashPassword = function (password) {
    var params = {
        alg: 'des-ede3',
        autopad: true,
        key: process.env.TOPUP_SERVICE_SECRET_KEY,
        plaintext: password,
        outputType: 'base64',
        iv: null
    };

    return des_ecb_encrypt(params);
};

var sendRequest = function (requestId, phoneNumber, amount) {
    var password = hashPassword(process.env.TOPUP_SERVICE_PASSWORD);
    var moment = require('moment-timezone');
    var payload = {
        username: process.env.TOPUP_SERVICE_USERNAME,
        password: password,
        reqid: requestId,
        reqtime: moment.tz('Asia/Ho_Chi_Minh').format('YYYYMMDDHHmmss'),
        phone: phoneNumber,
        amount: amount
    };

    payload['checksum'] = getCheckSum(payload);

    return requestPromise({
        url: process.env.TOPUP_SERVICE_URL,
        method: 'POST',
        body: payload,
        json: true
    });
};
module.exports = {
    createOrder: function (object, callback) {
        sendRequest(object.request_id, object.phone_number, object.amount)
            .then(function (res) {
                if (res.code != 0) {
                    callback({
                        status: 'FAIL',
                        message: res.message.toString()
                    });
                    log.error('FINVIET: ', res);
                } else {
                    var status = 'PENDING';

                    if (SuccessCodes.indexOf(res.code) >= 0) {
                        status = 'SUCCESS';
                    }

                    if (FailCodes.indexOf(res.code) >= 0) {
                        status = 'FAIL';
                    }

                    callback(null, {
                        status: status,
                        request_id: res.reqid
                    });

                    log.debug('FINVIET: ', res);
                }
            })
            .catch(function (err) {
                callback({
                    status: 'FAIL',
                    message: 'An error has occurred'
                });

                log.error('FINVIET: ', err);
            });
    },

    queryOrder: function (requestId, callback) {
        callback(null, {
            status: 'SUCCESS',
            request_id: requestId
        });
    }
};