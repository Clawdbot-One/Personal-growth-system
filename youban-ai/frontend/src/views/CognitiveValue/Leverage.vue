<template>
  <AppLayout>
    <div class="cl-index">
      <div class="page-header">
        <h1>🎯 杠杆点分析</h1>
        <p>识别你的高杠杆领域，用最小投入获得最大产出</p>
      </div>
      <div class="action-area">
        <el-button type="primary" size="large" round @click="runAnalysis" :loading="loading">开始分析</el-button>
      </div>
      <div class="result-section" v-if="store.result">
        <h3>能力杠杆</h3>
        <div class="leverage-card" v-for="al in store.result.abilityLeverage" :key="al.ability">
          <div class="lev-header"><span>{{ al.ability }}</span><el-tag type="success">ROI: {{ al.roi }}x</el-tag></div>
          <p>{{ al.strategy }}</p>
        </div>
        <h3>平台杠杆</h3>
        <div class="leverage-card" v-for="pl in store.result.platformLeverage" :key="pl.platform">
          <div class="lev-header"><span>{{ pl.platform }}</span><span class="lev-score">{{ pl.score }}</span></div>
          <p>{{ pl.desc }}</p>
        </div>
        <h3>人脉杠杆</h3>
        <div class="leverage-card" v-for="nl in store.result.networkLeverage" :key="nl.type">
          <div class="lev-header"><span>{{ nl.type }}</span><span class="lev-score">{{ nl.score }}</span></div>
          <p>{{ nl.desc }}</p>
        </div>
        <h3>资源杠杆</h3>
        <div class="leverage-card" v-for="rl in store.result.resourceLeverage" :key="rl.resource">
          <div class="lev-header"><span>{{ rl.resource }}</span><span class="lev-score">{{ rl.score }}</span></div>
          <p>{{ rl.desc }}</p>
        </div>
        <h3>80/20 关键行动</h3>
        <div class="roi-item" v-for="roi in store.result.roiAnalysis" :key="roi.action">
          <div class="roi-header"><span>{{ roi.action }}</span><el-tag size="small">{{ roi.timeFrame }}</el-tag></div>
          <div class="roi-meta"><span>投入：{{ roi.effort }}</span><span>预期回报：{{ roi.expectedReturn }}</span></div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import AppLayout from '@/components/layout/AppLayout.vue'
import { useLeverageAnalysisStore } from '@/stores/leverageAnalysis'
import { useAssessmentStore } from '@/stores/assessment'
import { ref } from 'vue'

const store = useLeverageAnalysisStore()
const loading = ref(false)

async function runAnalysis() {
  loading.value = true
  const assessmentStore = useAssessmentStore()
  const report = assessmentStore.reports[0]
  await store.runAnalysis({ topStrengths: report?.topStrengths?.map(s => s.name) || [] })
  loading.value = false
}
</script>

<style scoped>
.cl-index { max-width: 900px; margin: 0 auto; }
.page-header { text-align: center; margin-bottom: 36px; }
.page-header h1 { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
.page-header p { font-size: 15px; color: var(--text-secondary); }
.action-area { text-align: center; margin-bottom: 36px; }
.result-section h3 { font-size: 18px; font-weight: 600; margin: 24px 0 16px; }
.leverage-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 10px; padding: 18px; margin-bottom: 12px; }
.lev-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; font-size: 15px; font-weight: 600; }
.lev-score { color: #2563EB; font-weight: 700; font-size: 16px; }
.leverage-card p { font-size: 13px; color: var(--text-secondary); line-height: 1.6; }
.roi-item { background: var(--bg-card); border: 1px solid var(--border); border-left: 4px solid #67C23A; border-radius: 10px; padding: 18px; margin-bottom: 12px; }
.roi-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; font-size: 15px; font-weight: 600; }
.roi-meta { display: flex; gap: 24px; font-size: 13px; color: var(--text-muted); }
</style>