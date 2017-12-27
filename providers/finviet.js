'use strict'

const requestPromise = require('request-promise');
const dateFormat = require('dateformat');
var Log = require('timestamp-log');
var log = new Log(process.env.LOG_LEVEL);

var getCheckSum = function (payload) {
    var payloadValues = Object.values(payload);
    payloadValues.push(process.env.TOPUP_SERVICE_SECURE_HASH_KEY);

    var SHA1 = require('crypto-js/sha1');

    return SHA1(payloadValues.join(''));
};

var hashPassword = function (password) {
    var tripleDES = require('crypto-js/tripledes');

    return tripleDES.encrypt(password, process.env.TOPUP_SERVICE_SECURE_HASH_KEY);
};

var sendRequest = function (requestId, phoneNumber, amount) {
    var currentDate = new Date();
    var payload = {
        username: process.env.TOPUP_SERVICE_USERNAME,
        password: hashPassword(process.env.TOPUP_SERVICE_PASSWORD),
        reqId: requestId,
        reqTime: dateFormat(currentDate, 'yyyymmddHHMMss'),
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
                        code: 'error-create-order-request',
                        message: 'FINVIET: ' + res.message.toString()
                    });
                } else {
                    callback(null, {
                        code: res.code,
                        request_id: res.reqId,
                        transaction_id: res.transId
                    });
                }
            })
            .catch(function (err) {
                callback({
                    code: 'error-create-order-request',
                    message: 'FINVIET: ' + err.toString()
                });

                log.error(err);
            });
    },

    queryOrder: function (requestId, callback) {
        callback(null, {
            code: 0,
            request_id: requestId
        });
    }
};