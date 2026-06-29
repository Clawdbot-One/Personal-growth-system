<template>
  <AppLayout>
    <div class="cal-result" v-if="store.result">
      <div class="result-header">
        <h1>过度自信校准报告</h1>
        <p>基于置信度标定的校准分析</p>
      </div>
      <div class="stats-row">
        <div class="stat-card highlight">
          <span class="stat-value">{{ store.result.brierScore }}</span>
          <span class="stat-label">Brier 评分</span>
        </div>
        <div class="stat-card" :class="levelClass">
          <span class="stat-value">{{ calibrationLabel }}</span>
          <span class="stat-label">校准水平</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ store.result.accuracy }}%</span>
          <span class="stat-label">实际准确率</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ store.result.avgConfidence }}%</span>
          <span class="stat-label">平均置信度</span>
        </div>
      </div>
      <div class="gap-info" v-if="store.result.overconfidenceGap > 0">
        <el-alert :title="`过度自信差距：${store.result.overconfidenceGap}%（你的自信比实际准确率高 ${store.result.overconfidenceGap} 个百分点）`" type="warning" show-icon :closable="false" />
      </div>
      <div class="confidence-groups" v-if="store.result.confidenceGroups?.length > 0">
        <h3>置信度区间分析</h3>
        <div class="group-item" v-for="g in store.result.confidenceGroups" :key="g.range">
          <span class="group-range">{{ g.range }}</span>
          <el-progress :percentage="g.total > 0 ? Math.round(g.correct / g.total * 100) : 0" :stroke-width="16" :color="getGroupColor(g)" :format="() => `${g.correct}/${g.total}`" />
        </div>
      </div>
      <div class="detail-section">
        <h3>答题详情</h3>
        <div class="detail-item" v-for="r in store.result.results" :key="r.id" :class="{ correct: r.isCorrect, wrong: !r.isCorrect }">
          <div class="detail-header">
            <span class="detail-q">{{ r.questionText }}</span>
            <el-tag :type="r.isCorrect ? 'success' : 'danger'" size="small">{{ r.isCorrect ? '✓' : '✗' }}</el-tag>
          </div>
          <div class="detail-meta">
            <span>你的回答：{{ r.userAnswer === 'yes' ? '是' : '否' }}</span>
            <span>正确答案：{{ r.correctAnswer === 'yes' ? '是' : '否' }}</span>
            <span>置信度：{{ r.confidence }}%</span>
          </div>
          <div class="detail-hint" v-if="!r.isCorrect && r.hint">{{ r.hint }}</div>
        </div>
      </div>
      <div class="result-actions">
        <el-button type="primary" round @click="$router.push('/calibration')">重新校准</el-button>
        <el-button round @click="$router.push('/home')">返回首页</el-button>
      </div>
    </div>
    <div class="loading-state" v-else-if="store.loading"><el-icon :size="48" class="loading-icon"><Loading /></el-icon><p>加载中...</p></div>
    <div class="empty-state" v-else><el-empty description="未找到校准记录" /></div>
  </AppLayout>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useCalibrationStore } from '@/stores/calibration'
import AppLayout from '@/components/layout/AppLayout.vue'

const route = useRoute()
const store = useCalibrationStore()

const calibrationLabel = computed(() => {
  const map = { well_calibrated: '校准良好', overconfident: '过度自信', underconfident: '自信不足', uncalibrated: '未校准' }
  return map[store.result?.calibrationLevel] || '未知'
})

const levelClass = computed(() => {
  const map = { well_calibrated: 'level-good', overconfident: 'level-over', underconfident: 'level-under' }
  return map[store.result?.calibrationLevel] || ''
})

function getGroupColor(g) {
  const acc = g.total > 0 ? g.correct / g.total * 100 : 0
  const mid = parseInt(g.range.split('-')[0]) + 5
  if (acc >= mid - 10) return '#67C23A'
  if (acc >= mid - 25) return '#E6A23C'
  return '#F56C6C'
}

onMounted(async () => {
  const id = Number(route.params.id)
  if (id) await store.loadResult(id)
})
</script>

<style scoped>
.cal-result { max-width: 900px; margin: 0 auto; }
.result-header { text-align: center; margin-bottom: 36px; }
.result-header h1 { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
.result-header p { font-size: 15px; color: var(--text-secondary); }
.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
.stat-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 24px; text-align: center; }
.stat-card.highlight { border: 2px solid #059669; }
.stat-card.level-good { border-top: 3px solid #67C23A; }
.stat-card.level-over { border-top: 3px solid #F56C6C; }
.stat-card.level-under { border-top: 3px solid #E6A23C; }
.stat-value { font-size: 28px; font-weight: 700; display: block; margin-bottom: 4px; }
.stat-label { font-size: 13px; color: var(--text-muted); }
.gap-info { margin-bottom: 24px; }
.confidence-groups { margin-bottom: 36px; }
.confidence-groups h3 { font-size: 18px; font-weight: 600; margin-bottom: 16px; }
.group-item { display: flex; align-items: center; gap: 16px; margin-bottom: 12px; }
.group-range { font-size: 13px; color: var(--text-secondary); width: 60px; flex-shrink: 0; }
.group-item .el-progress { flex: 1; }
.detail-section h3 { font-size: 18px; font-weight: 600; margin-bottom: 16px; }
.detail-item { background: var(--bg-card); border: 1px solid var(--border); border-radius: 10px; padding: 18px; margin-bottom: 10px; }
.detail-item.correct { border-left: 4px solid #67C23A; }
.detail-item.wrong { border-left: 4px solid #F56C6C; }
.detail-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 8px; }
.detail-q { font-size: 14px; font-weight: 500; flex: 1; }
.detail-meta { display: flex; gap: 16px; font-size: 13px; color: var(--text-secondary); flex-wrap: wrap; }
.detail-hint { margin-top: 10px; padding: 10px; background: rgba(5,150,105,0.04); border-radius: 6px; font-size: 13px; color: var(--text-secondary); }
.result-actions { display: flex; gap: 12px; justify-content: center; margin-top: 36px; }
.loading-state, .empty-state { text-align: center; padding: 80px 20px; }
.loading-icon { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@media (max-width: 768px) { .stats-row { grid-template-columns: repeat(2, 1fr); } }
</style>