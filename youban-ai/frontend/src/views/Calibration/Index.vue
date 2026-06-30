<template>
  <AppLayout>
    <div class="cal-index">
      <div class="page-header">
        <h1 class="page-title">🎯 过度自信校准</h1>
        <p class="page-desc">基于置信度标定技术，帮助你准确认识自己的判断能力</p>
      </div>
      <div class="intro-cards">
        <div class="intro-card">
          <div class="intro-icon">📊</div>
          <h3>Brier 评分</h3>
          <p>标准化的预测准确度度量，数值越低表示校准越好。0 = 完美校准，1 = 完全未校准。</p>
        </div>
        <div class="intro-card">
          <div class="intro-icon">🔬</div>
          <h3>置信度标定</h3>
          <p>在回答每个问题时标注你的把握程度（50%-100%），系统对比你的信心与实际准确率。</p>
        </div>
        <div class="intro-card">
          <div class="intro-icon">📈</div>
          <h3>校准曲线</h3>
          <p>可视化"你认为的准确率"与"实际准确率"的差距，帮助你识别过度自信或自信不足。</p>
        </div>
      </div>
      <div class="action-area">
        <div class="usage-info" v-if="membershipStore.level !== 'admin'">
          <el-tag :type="usageInfo.remaining > 0 ? 'info' : 'danger'" size="large" effect="plain">
            本月已用 {{ usageInfo.usage }} / {{ usageInfo.limit === Infinity ? '∞' : usageInfo.limit }} 次
          </el-tag>
        </div>
        <el-button v-if="usageInfo.remaining > 0 || membershipStore.level === 'admin'" type="primary" size="large" round @click="startCalibration" :loading="loading">开始校准 <el-icon><ArrowRight /></el-icon></el-button>
        <el-button v-else type="warning" size="large" round @click="$router.push('/upgrade')">立即升级 <el-icon><ArrowRight /></el-icon></el-button>
      </div>
      <UpgradePrompt v-if="showUpgrade" title="校准次数已用完" :sub-title="`当前等级：${membershipStore.levelLabel}，本月已使用 ${usageInfo.usage}/${usageInfo.limit} 次`" :usage-info="usageInfo" />
      <div class="history-section" v-if="store.history.length > 0">
        <h3>校准记录</h3>
        <div class="history-item" v-for="h in store.history.slice(0, 5)" :key="h.id" @click="$router.push(`/calibration/result/${h.id}`)">
          <span>校准 #{{ h.id }}</span>
          <el-tag :type="h.calibration_level === 'well_calibrated' ? 'success' : h.calibration_level === 'overconfident' ? 'danger' : 'warning'" size="small">
            {{ h.calibration_level === 'well_calibrated' ? '校准良好' : h.calibration_level === 'overconfident' ? '过度自信' : '自信不足' }}
          </el-tag>
          <span>Brier: {{ h.brier_score }}</span>
          <span>{{ h.created_at }}</span>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import AppLayout from '@/components/layout/AppLayout.vue'
import UpgradePrompt from '@/components/common/UpgradePrompt.vue'
import { useCalibrationStore } from '@/stores/calibration'
import { useMembershipStore } from '@/stores/membership'
import { useRouter } from 'vue-router'
import { onMounted, ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const store = useCalibrationStore()
const membershipStore = useMembershipStore()
const loading = ref(false)
const showUpgrade = ref(false)
const usageInfo = computed(() => membershipStore.getFeatureLimit('calibration'))

onMounted(() => { store.loadHistory(); membershipStore.fetchLimits() })

async function startCalibration() {
  loading.value = true
  try {
    await store.startTest()
    router.push('/calibration/test')
  } catch (err) {
    if (err.response?.status === 403) { showUpgrade.value = true; membershipStore.fetchLimits() }
    else { ElMessage.error('启动校准失败，请稍后重试') }
  } finally { loading.value = false }
}
</script>

<style scoped>
.cal-index { max-width: 900px; margin: 0 auto; }
.page-header { text-align: center; margin-bottom: 36px; }
.page-title { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
.page-desc { font-size: 15px; color: var(--text-secondary); }
.intro-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 36px; }
.intro-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 24px; text-align: center; }
.intro-icon { font-size: 36px; margin-bottom: 12px; }
.intro-card h3 { font-size: 16px; font-weight: 600; margin-bottom: 8px; }
.intro-card p { font-size: 13px; color: var(--text-secondary); line-height: 1.6; }
.action-area { text-align: center; margin-bottom: 48px; }
.history-section h3 { font-size: 18px; font-weight: 600; margin-bottom: 16px; }
.history-item { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 8px; margin-bottom: 8px; cursor: pointer; font-size: 14px; }
.history-item:hover { background: rgba(37,99,235,0.04); }
@media (max-width: 768px) { .intro-cards { grid-template-columns: 1fr; } }
</style>