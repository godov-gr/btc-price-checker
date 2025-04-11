<template>
  <div>
    <h1>Данные цены Bitcoin</h1>
    <select v-model="selectedPeriod" @change="fetchPrices">
      <option value="day">День</option>
      <option value="week">Неделя</option>
      <option value="month">Месяц</option>
      <option value="year">Год</option>
      <option value="custom">Свои даты</option>
    </select>
    <div v-if="selectedPeriod === 'custom'">
      <label>Начало</label>
      <input type="date" v-model="customStart" />
      <label>Конец</label>
      <input type="date" v-model="customEnd" />
      <button @click="fetchPrices">Показать</button>
    </div>

    <line-chart :chartData="chartData" />
  </div>
</template>

<script>
import { Line } from 'vue-chartjs'
import { map } from 'lodash' // Опционально, если захотите

export default {
  components: {
    'line-chart': {
      extends: Line,
      props: ['chartData'],
      mounted () {
        this.renderChart(this.chartData, { responsive: true, maintainAspectRatio: false })
      },
      watch: {
        chartData(newData) {
          this.renderChart(newData, { responsive: true, maintainAspectRatio: false })
        }
      }
    }
  },
  data() {
    return {
      selectedPeriod: 'day',
      customStart: '',
      customEnd: '',
      chartData: {
        labels: [],
        datasets: [
          {
            label: 'BTC/USD',
            data: [],
            borderColor: '#42b983',
            fill: false
          }
        ]
      }
    }
  },
  methods: {
    async fetchPrices() {
      try {
        let url = `/api/prices?period=${this.selectedPeriod}`
        if (this.selectedPeriod === 'custom' && this.customStart && this.customEnd) {
          url += `&start=${this.customStart}&end=${this.customEnd}`
        }
        const response = await this.$axios.$get(url)
        const data = response

        this.chartData.labels = data.map(item => new Date(item.time).toLocaleString())
        this.chartData.datasets[0].data = data.map(item => item.rate)
      } catch (error) {
        console.error(error)
      }
    }
  },
  mounted() {
    this.fetchPrices()
  }
}
</script>

<style scoped>
/* При необходимости можно добавить стили */
</style>
