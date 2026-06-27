<template>
  <div class="quality-page">
    <div class="page-header">
      <h2>练习质量分析</h2>
      <p class="subtitle">基于刻意练习四维度（目标明确度、走出舒适区、即时反馈、高度专注）评估每次练习质量</p>
    </div>

    <div class="content-grid">
      <div class="main-col">
        <el-card class="section-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="card-title">质量评分趋势</span>
              <el-select v-model="daysFilter" style="width: 120px" size="small" @change="fetchData">
                <el-option label="近7天" :value="7" />
                <el-option label="近30天" :value="30" />
                <el-option label="近90天" :value="90" />
              </el-select>
            </div>
          </template>
          <div v-if="scores.length > 0" class="chart-area">
            <div class="chart-container" ref="chartRef" style="height: 300px;"></div>
          </div>
          <el-empty v-else description="还没有练习记录" :image-size="80" />
        </el-card>

        <el-card class="section-card" shadow="never">
          <template #header>
            <span class="card-title">练习记录详情</span>
          </template>
          <el-table :data="scores" style="width: 100%" size="small">
            <el-table-column prop="goal" label="练习目标" min-width="160" show-overflow-tooltip />
            <el-table-column label="目标明确" width="90">
              <template #default="{ row }">
                <el-progress :percentage="row.goalClarity" :stroke-width="6" :color="row.goalClarity >= 70 ? '#10B981' : '#F59E0B'" />
              </template>
            </el-table-column>
            <el-table-column label="走出舒适区" width="90">
              <template #default="{ row }">
                <el-progress :percentage="row.comfortZoneBreak" :stroke-width="6" :color="row.comfortZoneBreak >= 70 ? '#10B981' : '#F59E0B'" />
              </template>
            </el-table-column>
            <el-table-column label="反馈质量" width="90">
              <template #default="{ row }">
                <el-progress :percentage="row.feedbackQuality" :stroke-width="6" :color="row.feedbackQuality >= 70 ? '#10B981' : '#F59E0B'" />
              </template>
            </el-table-column>
            <el-table-column label="专注强度" width="90">
              <template #default="{ row }">
                <el-progress :percentage="row.focusIntensity" :stroke-width="6" :color="row.focusIntensity >= 70 ? '#10B981' : '#F59E0B'" />
              </template>
            </el-table-column>
            <el-table-column label="综合" width="70">
              <template #default="{ row }">
                <el-tag :type="row.overall >= 85 ? 'success' : row.overall >= 70 ? '' : 'warning'" size="small">
                  {{ row.overall }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="time" label="时间" width="110" />
          </el-table>
        </el-card>
      </div>

      <div class="side-col">
        <el-card class="section-card" shadow="never">
          <template #header>
            <span class="card-title">四维度雷达图</span>
          </template>
          <div ref="radarRef" style="height: 300px;"></div>
        </el-card>

        <el-card class="section-card" shadow="never">
          <template #header>
            <span class="card-title">刻意练习 vs 普通练习</span>
          </template>
          <div class="comparison">
            <div class="comp-row">
              <span class="comp-label">有效练习时间占比</span>
              <el-progress :percentage="effectiveRatio" :stroke-width="10" :color="effectiveRatio >= 70 ? '#10B981' : '#F59E0B'" />
            </div>
            <div class="comp-row">
              <span class="comp-label">高质量练习占比</span>
              <el-progress :percentage="highQualityRatio" :stroke-width="10" :color="highQualityRatio >= 50 ? '#2563EB' : '#F59E0B'" />
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import request from '@/api/request.js'

const daysFilter = ref(30)
const scores = ref([])
const chartRef = ref(null)
const radarRef = ref(null)
let chartInstance = null
let radarInstance = null

const effectiveRatio = computed(() => {
  if (!scores.value.length) return 0
  const avg = scores.value.reduce((s, r) => s + r.focusIntensity, 0) / scores.value.length
  return Math.round(avg)
})

const highQualityRatio = computed(() => {
  if (!scores.value.length) return 0
  const high = scores.value.filter(s => s.overall >= 70).length
  return Math.round((high / scores.value.length) * 100)
})

async function fetchData() {
  try {
    const res = await request.get('/dp/quality', { params: { days: daysFilter.value } })
    if (res.code === 0) {
      scores.value = res.data.scores
      await nextTick()
      renderChart()
      renderRadar()
    }
  } catch { /* ignore */ }
}

function renderChart() {
  if (!chartRef.value) return
  if (chartInstance) chartInstance.dispose()
  chartInstance = echarts.init(chartRef.value)

  const data = [...scores.value].reverse()
  const option = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['目标明确', '走出舒适区', '反馈质量', '专注强度', '综合评分'], bottom: 0 },
    grid: { left: 40, right: 20, top: 20, bottom: 40 },
    xAxis: { type: 'category', data: data.map((_, i) => `#${i + 1}`), axisLabel: { fontSize: 11 } },
    yAxis: { type: 'value', min: 0, max: 100 },
    series: [
      { name: '目标明确', type: 'line', data: data.map(s => s.goalClarity), smooth: true, lineStyle: { color: '#2563EB' }, itemStyle: { color: '#2563EB' } },
      { name: '走出舒适区', type: 'line', data: data.map(s => s.comfortZoneBreak), smooth: true, lineStyle: { color: '#F59E0B' }, itemStyle: { color: '#F59E0B' } },
      { name: '反馈质量', type: 'line', data: data.map(s => s.feedbackQuality), smooth: true, lineStyle: { color: '#10B981' }, itemStyle: { color: '#10B981' } },
      { name: '专注强度', type: 'line', data: data.map(s => s.focusIntensity), smooth: true, lineStyle: { color: '#8B5CF6' }, itemStyle: { color: '#8B5CF6' } },
      { name: '综合评分', type: 'line', data: data.map(s => s.overall), smooth: true, lineStyle: { color: '#303133', width: 2, type: 'dashed' }, itemStyle: { color: '#303133' } },
    ],
  }
  chartInstance.setOption(option)
}

function renderRadar() {
  if (!radarRef.value) return
  if (radarInstance) radarInstance.dispose()
  radarInstance = echarts.init(radarRef.value)

  const recent = scores.value.slice(0, 5)
  const avgGoal = recent.length ? Math.round(recent.reduce((s, r) => s + r.goalClarity, 0) / recent.length) : 0
  const avgComfort = recent.length ? Math.round(recent.reduce((s, r) => s + r.comfortZoneBreak, 0) / recent.length) : 0
  const avgFeedback = recent.length ? Math.round(recent.reduce((s, r) => s + r.feedbackQuality, 0) / recent.length) : 0
  const avgFocus = recent.length ? Math.round(recent.reduce((s, r) => s + r.focusIntensity, 0) / recent.length) : 0

  const option = {
    tooltip: {},
    radar: {
      indicator: [
        { name: '目标明确度', max: 100 },
        { name: '走出舒适区', max: 100 },
        { name: '即时反馈', max: 100 },
        { name: '高度专注', max: 100 },
      ],
      center: ['50%', '55%'],
      radius: '70%',
    },
    series: [{
      type: 'radar',
      data: [{ value: [avgGoal, avgComfort, avgFeedback, avgFocus], name: '近5次平均', areaStyle: { color: 'rgba(37,99,235,0.2)' } }],
      lineStyle: { color: '#2563EB' },
      itemStyle: { color: '#2563EB' },
    }],
  }
  radarInstance.setOption(option)
}

onMounted(fetchData)
watch(daysFilter, fetchData)
</script>

<style scoped>
.quality-page { max-width: 1200px; margin: 0 auto; }
.page-header { margin-bottom: 20px; }
.page-header h2 { font-size: 22px; font-weight: 700; color: #303133; margin: 0; }
.subtitle { color: #909399; font-size: 14px; margin-top: 4px; }

.content-grid { display: grid; grid-template-columns: 1fr 360px; gap: 20px; }
.section-card { margin-bottom: 20px; }
.section-card :deep(.el-card__header) { padding: 14px 20px; border-bottom: 1px solid #ebeef5; }
.section-card :deep(.el-card__body) { padding: 20px; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.card-title { font-size: 15px; font-weight: 600; color: #303133; }

.comparison { display: flex; flex-direction: column; gap: 16px; }
.comp-row { display: flex; flex-direction: column; gap: 6px; }
.comp-label { font-size: 13px; color: #606266; }

@media (max-width: 768px) {
  .content-grid { grid-template-columns: 1fr; }
}
</style>