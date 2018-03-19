const campaigns = require('../dataSources/campaigns.js').Campaigns
const util = require('util')
const events = require('events')
const _ = require('lodash')

var ValueCalculator = function ValueCalculator() {
    //scope used for closures
    var valueCalculator = this

    valueCalculator.on('calculateValue', function (redemption) {
        let value_constraints = _.find(campaigns, { campaign_id: redemption.campaign_id }).value_constraints

        if (value_constraints.value_type.dynamic) {
            console.log("Dynamic value calculations are hard to do, and potentially add no value. Is this REALLY what you want?");
        } else {
            let cashback = (Math.floor(redemption.gross_amount * value_constraints.static_value_amount))
            if (cashback > value_constraints.cashback_range.maximum_cashback) {
                redemption.cashback = value_constraints.cashback_range.maximum_cashback
            } else if (cashback < value_constraints.cashback_range.minimum_cashback) {
                redemption.cashback = value_constraints.cashback_range.minimum_cashback
            } else {
                redemption.cashback = cashback
            }
        }

        valueCalculator.emit('valueReady', redemption)
    })
}

util.inherits(ValueCalculator, events.EventEmitter)
module.exports = ValueCalculator