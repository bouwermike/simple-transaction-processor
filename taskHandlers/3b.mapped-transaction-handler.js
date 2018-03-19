const brands = require('../dataSources/brands.js').Brands
const util = require('util')
const events = require('events')
const _ = require('lodash')

var MappedTransactionHandler = function MappedTransactionHandler() {
    //scope used for closures
    var mappedTransactionHandler = this

    mappedTransactionHandler.on('handleMappedTransaction', function (transaction) {

        //the ID of the store in question
        let storeID = transaction.store.store_id
        //an array to transport any brands the store might belong to
        let brandList = []

        //go through brands and look for matches
        for (let i = 0; i < brands.length; i++) {
            const brand = brands[i];
            if (brand.store_ids.includes(storeID)) {
                brandList.push(brand.brand_id)
            } else {
                //do nothing
            }
        }

        //If any brands are found, pass these on to the next handler, else handlet the transaction with no brand
        if (brandList.length > 0) {
            mappedTransactionHandler.emit('storeExistsInBrand', transaction, _.uniq(brandList))
        } else {
            mappedTransactionHandler.emit('storeDoesNotExistInBrand', transaction)
        }
    })
}

util.inherits(MappedTransactionHandler, events.EventEmitter)
module.exports = MappedTransactionHandler