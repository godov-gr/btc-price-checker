const express = require('express')
const mongoose = require('mongoose')

const router = express.Router()

// При необходимости вынесите схему и модель в отдельный файл, например, models/Price.js
const PriceSchema = new mongoose.Schema({
  time: { type: Date, required: true },
  rate: { type: Number, required: true }
})
const Price = mongoose.model('Price', PriceSchema)

// Подключение к БД (по хорошей практике делается один раз глобально в проекте)
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

// Эндпоинт /api/prices
router.get('/prices', async (req, res) => {
  const { period, start, end } = req.query

  let toDate = new Date()
  let fromDate

  switch (period) {
    case 'day':
      fromDate = new Date(Date.now() - 24 * 60 * 60 * 1000)
      break
    case 'week':
      fromDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      break
    case 'month':
      fromDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      break
    case 'year':
      fromDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
      break
    case 'custom':
      fromDate = new Date(start)
      toDate = new Date(end)
      break
    default:
      fromDate = new Date(Date.now() - 24 * 60 * 60 * 1000)
  }

  try {
    const prices = await Price.find({
      time: { $gte: fromDate, $lte: toDate }
    }).sort({ time: 1 })

    res.json(prices)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Ошибка получения данных' })
  }
})

module.exports = router
