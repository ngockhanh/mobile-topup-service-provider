'use strict';
var publisher = require('../../connectors/publisher');
/**
 * Operations on /order/checkTrans
 */
module.exports = {
    /**
     * summary: 
     * description: Check order info by transaction id
     * parameters: transaction_id
     * produces: application/json
     * responses: 200, default
     * operationId: checkTrans
     */
    get: {
        200: function (req, res, callback) {
            /**
             * Using mock data generator module.
             * Replace this by actual data for the api.
             */
            publisher.queryOrder(req.query.request_id, callback);
        },
        default: function (req, res, callback) {
            /**
             * Using mock data generator module.
             * Replace this by actual data for the api.
             */

        }
    }
};
