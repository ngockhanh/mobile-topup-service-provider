'use strict';
var publisher = require('../connectors/publisher');
/**
 * Operations on /order
 */
module.exports = {
    /**
     * summary: 
     * description: Create nre topup order
     * parameters: body
     * produces: application/json
     * responses: 200, default
     * operationId: createOrder
     */
    post: {
        200: function (req, res, callback) {
            publisher.createOrder(req.body.request_id, req.body.phone_number, req.body.amount, req.body.provider, callback);
        },
        default: function (req, res, callback) {
            /**
             * Using mock data generator module.
             * Replace this by actual data for the api.
             */
        }
    }
};
