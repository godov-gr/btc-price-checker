const axios = require('axios')
const mongoose = require('mongoose')
const cron = require('node-cron')

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

const PriceSchema = new mongoose.Schema({
  time: { type: Date, required: true },
  rate: { type: Number, required: true }
})
const Price = mongoose.model('Price', PriceSchema)

async function fetchAndStorePrice() {
  try {
    const response = await axios.get('https://api.coindesk.com/v1/bpi/currentprice.json')
    const data = response.data
    const rate = parseFloat(data.bpi.USD.rate.replace(',', ''))
    const priceEntry = new Price({
      time: new Date(data.time.updatedISO),
      rate
    })
    await priceEntry.save()
    console.log('Новая цена сохранена:', priceEntry)
  } catch (error) {
    console.error('Ошибка при получении или сохранении цены:', error)
  }
}

// cron: выполняем задачу каждую минуту
cron.schedule('* * * * *', fetchAndStorePrice)
