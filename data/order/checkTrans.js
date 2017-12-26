'use strict';
var Mockgen = require('../mockgen.js');
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
            Mockgen().responses({
                path: '/order/checkTrans',
                operation: 'get',
                response: '200'
            }, callback);
        },
        default: function (req, res, callback) {
            /**
             * Using mock data generator module.
             * Replace this by actual data for the api.
             */
            Mockgen().responses({
                path: '/order/checkTrans',
                operation: 'get',
                response: 'default'
            }, callback);
        }
    }
};
