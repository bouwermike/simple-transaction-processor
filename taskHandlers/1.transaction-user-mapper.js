const users = require('../dataSources/users.js')
const util = require('util')
const events = require('events')
const _ = require('lodash')

var TransactionUserMapper = function TransactionUserMapper() {
    // scope used for closures
    var transactionUserMapper = this

    transactionUserMapper.on('mapToUser', function (transaction) {
        var SSN_ = transaction.SSN
        let user = _.find(users.Users, {SSN: SSN_} )
       
        transaction.user.first_name = user.first_name
        transaction.user.last_name = user.last_name
        transaction.user.gender = user.gender

        transactionUserMapper.emit('userMapped', transaction)

    }) 
}

util.inherits(TransactionUserMapper, events.EventEmitter)
module.exports = TransactionUserMapper