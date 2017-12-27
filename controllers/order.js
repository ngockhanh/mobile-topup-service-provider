'use strict';
var dataProvider = require('../models/order.js');
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
     */
    post: function createOrder(req, res, next) {
        /**
         * Get the data for response 200
         * For response `default` status 200 is used.
         */
        var status = 200;
        var provider = dataProvider['post']['200'];
        provider(req, res, function (err, data) {
            if (err) {
                next(err);
                return;
            }
            res.status(status).send(data);
        });
    }
};
