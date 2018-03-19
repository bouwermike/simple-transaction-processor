const util = require('util')
const events = require('events')


var UnmappedTransactionHandler = function UnmappedTransactionHandler() {
    //scope used for closures
    var unmappedTransactionHandler = this

    unmappedTransactionHandler.on('handleUnmappedTransaction', function (transaction) {
        //load transaction into queue to be processed by mapping
        console.log("Loaded transaction " + transaction.id + " into queue for mapping. Event loop closed.")

    })
}

util.inherits(UnmappedTransactionHandler, events.EventEmitter)
module.exports = UnmappedTransactionHandler