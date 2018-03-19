/*
#### Incoming Transaction Events ####
*/
//Require modules and instantiate
//transaction generator
var Transaction = require('./dataSources/transactions.js')
var transaction = new Transaction()
//user to transaction mapper
var TransactionUserMapper = require('./taskHandlers/1.transaction-user-mapper.js')
var transactionUserMapper = new TransactionUserMapper()
//store to transaction mapper
var TransactionStoresMapper = require('./taskHandlers/2.transaction-stores-mapper.js')
var transactionStoresMapper = new TransactionStoresMapper()
//unmapped transactions handler
var UnmappedTransactionHandler = require('./taskHandlers/3a.unmapped-transaction-handler.js')
var unmappedTransactionHandler = new UnmappedTransactionHandler()
//mapped transactions handler
var MappedTransactionHandler = require('./taskHandlers/3b.mapped-transaction-handler.js')
var mappedTransactionHandler = new MappedTransactionHandler()
//campaign checker
var CampaignChecker = require('./taskHandlers/4.campaign-checker.js')
var campaignChecker = new CampaignChecker()
//redemption handler
var RedemptionHandler = require('./taskHandlers/5.redemption-handler.js')
var redemptionHandler = new RedemptionHandler()
//value calculator
var ValueCalculator = require('./taskHandlers/6.value-calculator.js')
var valueCalculator = new ValueCalculator()


//Start transaction generator
setInterval(() => {
  transaction.emit('randomise')
}, 300)
setInterval(() => {
  transaction.emit('generate')
}, 1000)

//Map transactions to a user
transaction.on('received', function (transaction) {
  transactionUserMapper.emit('mapToUser', transaction)
})

//Map transactions to a store
transactionUserMapper.on('userMapped', function (transaction) {
  transactionStoresMapper.emit('mapToStore', transaction)
})

//Handle transactions not mapped to a store by passing to queue for mapping
transactionStoresMapper.on('unmappedTransaction', function (transaction) {
  unmappedTransactionHandler.emit('handleUnmappedTransaction', transaction)
})

//Handle transactions mapped to a store by checking if the store exists in any brands
transactionStoresMapper.on('storeMapped', function (transaction) {
  mappedTransactionHandler.emit('handleMappedTransaction', transaction)
})

//Handle transactions at a store with that belongs to an active brand by checking 
//if there are any active campaigns
mappedTransactionHandler.on('storeExistsInBrand', function (transaction, brandList) {
  campaignChecker.emit('checkForCampaigns', transaction, brandList)
})

//Handle transactions at a store that does not belong to an active brand by persisting 
//the transaction and closing out the event loop
mappedTransactionHandler.on('storeDoesNotExistInBrand', function (transaction) {
  console.log("Transaction " + transaction.id + " saved to database. No active brand. Event loop closed.");
})

//Handle transactions at brands that have an active campaign by creating a redemption event
campaignChecker.on('campaignFound', function (transaction, campaignList) {
  redemptionHandler.emit('handleRedemption', transaction, campaignList)
})

//Handle transactions at brands that have no campaigns running
campaignChecker.on('noCampaignFound', function (transaction) {
  console.log("Transaction " + transaction.id + " saved to database. No active campaigns. Event loop closed.");
})

//If the transaction passed the neccessary time and purchase conditions then pass the resulting redemption on to the value calculator
redemptionHandler.on('redemptionReadyForValue', function (redemption) {
  valueCalculator.emit('calculateValue', redemption )
})

//if the transaction failed a condition cehck, then close out the loop
redemptionHandler.on('noRedemptionTriggered', function (transaction) {
  console.log('Transaction ' + transaction.id + ' did not pass the time and purchase conditions necessary to trigger a redemption. Event loop closed.');
})

//Success! We have a cashback value ready to go!
valueCalculator.on('valueReady', function(redemption){
  console.log('Push notification sent with message: ' + redemption.push_message + ' and cashback amount ' + redemption.cashback + '. Event loop closed.')
})

