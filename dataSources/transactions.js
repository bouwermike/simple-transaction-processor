const util = require('util')
const events = require('events')
const faker = require('faker');



var Transaction = function Transaction() {
  // scope used for closures
  var transaction = this

  //Data Models
  const transaction_metadata = [
    {
      payment_terminal_id: 'izet_kjhsdaf_73',
      country_code: 'FI',
      currency: 'EUR'
    },
    {
      payment_terminal_id: 'HM_liljeholm3',
      country_code: 'SE',
      currency: 'SEK'
    },
    {
      payment_terminal_id: 'could_nine_torsgatan',
      country_code: 'SE',
      currency: 'SEK'
    },
    {
      payment_terminal_id: '',
      country_code: '',
      currency: ''
    }
  ]

  const SSNs = [
    '970714-6776',
    '960601-3812',
    '450506-9874',
    '640818-6101'
  ]

  var index = 0

  //Create a random set of metadata 
  transaction.on('randomise', () => {
    transaction_metadata[3].payment_terminal_id = faker.finance.bitcoinAddress()
    transaction_metadata[3].country_code = faker.address.countryCode()
    transaction_metadata[3].currency = faker.finance.currencyCode()
    index = Math.floor(Math.random() * (3 - 0 + 1)) + 0
  })

  transaction.on('generate', function () {
    let rawTransaction = {
      id: faker.random.uuid(),
      create_time: Date.now(),
      SSN: SSNs[index],
      payment_terminal_id: transaction_metadata[index].payment_terminal_id,
      country_code: transaction_metadata[index].country_code,
      currency: transaction_metadata[index].currency,
      amount: faker.finance.amount(),
      user: {
        first_name: '',
        last_name: '',
        gender: ''
      },
      store: {
        store_id: '',
        store_name: ''
      }
    }
    transaction.emit('received', rawTransaction)
  })
}

util.inherits(Transaction, events.EventEmitter)
module.exports = Transaction