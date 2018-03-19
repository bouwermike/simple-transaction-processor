const stores = require('../dataSources/stores.js')
const util = require('util')
const events = require('events')
const _ = require('lodash')

var TransactionStoresMapper = function TransactionStoresMapper() {
    //scope used for closures
    var transactionStoresMapper = this

    transactionStoresMapper.on('mapToStore', function (transaction) {
        var payment_terminal_id_ = transaction.payment_terminal_id
        let store = _.find(stores.Stores, { payment_terminal_id: payment_terminal_id_ })

        if (store) {
            transaction.store.store_name = store.store_name
            transaction.store.store_id = store.store_id
            transactionStoresMapper.emit('storeMapped', transaction)
        } else {
            transactionStoresMapper.emit('unmappedTransaction', transaction)
        }

    })
}

util.inherits(TransactionStoresMapper, events.EventEmitter)
module.exports = TransactionStoresMapper