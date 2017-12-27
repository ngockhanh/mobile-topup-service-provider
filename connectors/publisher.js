'use strict';
const CollectorHandler = require('../collector-handler');

module.exports = {
    createOrder: function (requestId, phoneNumber, amount, provider, callback) {
        var collectorHandler = new CollectorHandler();
        collectorHandler.sendRequestToServiceProvider({
            request_id: requestId,
            phone_number: phoneNumber,
            amount: amount,
            provider: provider
        }, callback);
    },

    queryOrder: function (requestId, callback) {
        var collectorHandler = new CollectorHandler();
        collectorHandler.sendCheckingRequestToServiceProvider(requestId, callback);
    }
};