'use strict';
const CollectorHandler = require('../collector-handler');

module.exports = {
    createOrder: function (requestId, phoneNumber, amount, callback) {
        var collectorHandler = new CollectorHandler();
        collectorHandler.sendRequestToServiceProvider({
            request_id: requestId,
            phone_number: phoneNumber,
            amount: amount
        }, callback);
    },

    queryOrder: function (requestId, callback) {
        var collectorHandler = new CollectorHandler();
        collectorHandler.sendCheckingRequestToServiceProvider(requestId, callback);
    }
};