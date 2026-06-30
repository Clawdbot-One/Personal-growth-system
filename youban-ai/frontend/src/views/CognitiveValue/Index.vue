<template>
  <AppLayout>
    <div class="cv-index">
      <div class="page-header">
        <h1>💎 价值定位分析</h1>
        <p>基于价值公式（有用性 × 稀缺性 × 不可替代性）评估你的个人价值</p>
      </div>
      <div class="formula-card">
        <div class="formula"><span class="f-item">有用性</span><span class="f-op">×</span><span class="f-item">稀缺性</span><span class="f-op">×</span><span class="f-item">不可替代性</span><span class="f-op">=</span><span class="f-result">个人价值</span></div>
      </div>
      <div class="action-area">
        <div class="usage-info" v-if="membershipStore.level !== 'admin'">
          <el-tag :type="usageInfo.remaining > 0 ? 'info' : 'danger'" size="large" effect="plain">
            本月已用 {{ usageInfo.usage }} / {{ usageInfo.limit === Infinity ? '∞' : usageInfo.limit }} 次
          </el-tag>
        </div>
        <el-button v-if="usageInfo.remaining > 0 || membershipStore.level === 'admin'" type="primary" size="large" round @click="runAnalysis" :loading="loading">开始分析</el-button>
        <el-button v-else type="warning" size="large" round @click="$router.push('/upgrade')">立即升级 <el-icon><ArrowRight /></el-icon></el-button>
      </div>
      <UpgradePrompt v-if="showUpgrade" title="分析次数已用完" :sub-title="`当前等级：${membershipStore.levelLabel}，本月已使用 ${usageInfo.usage}/${usageInfo.limit} 次`" :usage-info="usageInfo" />
      <div class="result-section" v-if="store.result">
        <div class="stats-row">
          <div class="stat-card"><span class="stat-value">{{ store.result.valueIndex }}</span><span class="stat-label">价值指数</span></div>
          <div class="stat-card"><span class="stat-value">{{ store.result.usefulness }}</span><span class="stat-label">有用性</span></div>
          <div class="stat-card"><span class="stat-value">{{ store.result.scarcity }}</span><span class="stat-label">稀缺性</span></div>
          <div class="stat-card"><span class="stat-value">{{ store.result.irreplaceability }}</span><span class="stat-label">不可替代性</span></div>
        </div>
        <h3>最佳匹配领域</h3>
        <div class="field-item" v-for="f in store.result.topFields" :key="f.name">
          <div class="field-header"><span>{{ f.name }}</span><span class="field-match">{{ f.match }}%</span></div>
          <el-progress :percentage="f.match" :stroke-width="8" :color="getFieldColor(f.match)" />
        </div>
        <h3>提升建议</h3>
        <div class="rec-item" v-for="r in store.result.recommendations" :key="r.title">
          <h4>{{ r.title }}</h4><p>{{ r.desc }}</p><el-tag size="small">{{ r.action }}</el-tag>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import AppLayout from '@/components/layout/AppLayout.vue'
import UpgradePrompt from '@/components/common/UpgradePrompt.vue'
import { useValueAnalysisStore } from '@/stores/valueAnalysis'
import { useMembershipStore } from '@/stores/membership'
import { useAssessmentStore } from '@/stores/assessment'
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

const store = useValueAnalysisStore()
const membershipStore = useMembershipStore()
const loading = ref(false)
const showUpgrade = ref(false)
const usageInfo = computed(() => membershipStore.getFeatureLimit('value-analysis'))

onMounted(() => { membershipStore.fetchLimits() })

function getFieldColor(match) { return match >= 80 ? '#67C23A' : match >= 60 ? '#2563EB' : '#E6A23C' }

async function runAnalysis() {
  loading.value = true
  const assessmentStore = useAssessmentStore()
  const latestReport = assessmentStore.reports[0]
  try {
    await store.runAnalysis({
      talent: latestReport?.scores?.talent || 0,
      skill: latestReport?.scores?.skill || 0,
      character: latestReport?.scores?.character || 0,
      value: latestReport?.scores?.value || 0,
    })
  } catch (err) {
    if (err.response?.status === 403) { showUpgrade.value = true; membershipStore.fetchLimits() }
    else { ElMessage.error('分析失败，请稍后重试') }
  } finally { loading.value = false }
}
</script>

<style scoped>
.cv-index { max-width: 900px; margin: 0 auto; }
.page-header { text-align: center; margin-bottom: 36px; }
.page-header h1 { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
.page-header p { font-size: 15px; color: var(--text-secondary); }
.formula-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px; padding: 32px; margin-bottom: 36px; text-align: center; }
.formula { display: flex; align-items: center; justify-content: center; gap: 12px; flex-wrap: wrap; }
.f-item { background: rgba(255,255,255,0.2); color: white; padding: 8px 20px; border-radius: 8px; font-size: 18px; font-weight: 600; }
.f-op { color: rgba(255,255,255,0.8); font-size: 24px; font-weight: 300; }
.f-result { background: white; color: #764ba2; padding: 8px 24px; border-radius: 8px; font-size: 18px; font-weight: 700; }
.action-area { text-align: center; margin-bottom: 36px; }
.result-section { margin-top: 36px; }
.result-section h3 { font-size: 18px; font-weight: 600; margin: 24px 0 16px; }
.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
.stat-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 24px; text-align: center; }
.stat-value { font-size: 28px; font-weight: 700; display: block; margin-bottom: 4px; }
.stat-label { font-size: 13px; color: var(--text-muted); }
.field-item { margin-bottom: 16px; }
.field-header { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; font-weight: 500; }
.field-match { color: #2563EB; font-weight: 600; }
.rec-item { background: var(--bg-card); border: 1px solid var(--border); border-radius: 10px; padding: 18px; margin-bottom: 12px; }
.rec-item h4 { font-size: 15px; font-weight: 600; margin-bottom: 6px; }
.rec-item p { font-size: 13px; color: var(--text-secondary); margin-bottom: 8px; line-height: 1.6; }
@media (max-width: 768px) { .stats-row { grid-template-columns: repeat(2, 1fr); } }
</style>