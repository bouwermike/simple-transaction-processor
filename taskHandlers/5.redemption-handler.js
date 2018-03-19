const campaigns = require('../dataSources/campaigns.js').Campaigns
const util = require('util')
const events = require('events')
const _ = require('lodash')
const faker = require('faker');
const getHours = require('date-fns/get_hours')
const getDay = require('date-fns/get_day')

var RedemptionHandler = function RedemptionHandler() {
    //scope used for closures
    var redemptionHandler = this

    redemptionHandler.on('handleRedemption', function (transaction, campaignList) {
        campaignList.forEach(c => {
            let campaign = _.find(campaigns, { campaign_id: c })

            //Condition checks. All must evaluate to true for the redemption to fire
            let time_conditions_check = false
            let purchase_conditions_check = false

            //check time conditions
            let transaction_hour = getHours(transaction.create_time)
            let transaction_day_of_week = getDay(transaction.create_time)

            if (campaign.conditions.time_conditions.time_of_day == null && campaign.conditions.time_conditions.day_of_week == null) {
                time_conditions_check = true
            } else if (campaign.conditions.time_conditions.time_of_day == null) {
                if (campaign.conditions.time_conditions.day_of_week.includes(transaction_day_of_week)) {
                    time_conditions_check = true
                } else {
                    time_conditions_check = false
                }
            } else {
                if (campaign.conditions.time_conditions.time_of_day.includes(transaction_hour)) {
                    time_conditions_check = true
                } else {
                    time_conditions_check = false
                }
            }

            //check purchase conditions
            let amount = parseInt(transaction.amount)

            if (amount >= campaign.conditions.purchase_conditions.minimum_spend) {
                purchase_conditions_check = true
            } else {
                purchase_conditions_check = false
            }

            if (time_conditions_check && purchase_conditions_check) {
                //instantiate a redemption
                let redemption = {
                    id: faker.random.uuid(),
                    transaction_id: transaction.id,
                    campaign_id: campaign.campaign_id,
                    user_SSN: transaction.SSN,
                    gross_amount: amount,
                    cashback: 0,
                    push_message: campaign.messaging.push_notification_message
                }
                redemptionHandler.emit('redemptionReadyForValue', redemption)
            } else {
                redemptionHandler.emit('noRedemptionTriggered', transaction)
            }
        });
    })
}

util.inherits(RedemptionHandler, events.EventEmitter)
module.exports = RedemptionHandler