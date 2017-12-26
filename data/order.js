'use strict';
var Mockgen = require('./mockgen.js');
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
            /**
             * Using mock data generator module.
             * Replace this by actual data for the api.
             */
            Mockgen().responses({
                path: '/order',
                operation: 'post',
                response: '200'
            }, callback);
        },
        default: function (req, res, callback) {
            /**
             * Using mock data generator module.
             * Replace this by actual data for the api.
             */
            Mockgen().responses({
                path: '/order',
                operation: 'post',
                response: 'default'
            }, callback);
        }
    }
};
