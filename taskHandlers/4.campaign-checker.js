const brands = require('../dataSources/brands.js').Brands
const campaigns = require('../dataSources/campaigns.js').Campaigns
const util = require('util')
const events = require('events')
const _ = require('lodash')

var CampaignChecker = function CampaignChecker() {
    //scope used for closures
    var campaignChecker = this

    campaignChecker.on('checkForCampaigns', function (transaction, brandList) {
        //an array to transport the list of arrays
        let campaignList = []

        //fetch any active campaigns
        for (let i = 0; i < campaigns.length; i++) {
            let campaignBrandID = campaigns[i].brand_id;
            let campaignID = campaigns[i].campaign_id
            let campaignStatus = campaigns[i].active

            if (brandList.includes(campaignBrandID) && campaignStatus) {
                campaignList.push(campaignID)
            }
        }

        if (campaignList.length > 0) {
            campaignChecker.emit('campaignFound', transaction, _.uniq(campaignList))
        } else {
            campaignChecker.emit('noCampaignFound', transaction)
        }
    })
}

util.inherits(CampaignChecker, events.EventEmitter)
module.exports = CampaignChecker