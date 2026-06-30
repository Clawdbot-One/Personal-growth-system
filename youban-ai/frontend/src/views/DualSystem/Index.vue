<template>
  <AppLayout>
    <div class="ds-index">
      <div class="page-header">
        <h1 class="page-title">🧩 双系统思维训练</h1>
        <p class="page-desc">基于诺贝尔奖得主丹尼尔·卡尼曼的双系统理论，训练你的"慢思考"能力</p>
      </div>
      <div class="systems-compare">
        <div class="system-card system1">
          <div class="sys-icon">⚡</div>
          <h3>系统1：快思考</h3>
          <ul><li>自动的、直觉的</li><li>无需努力</li><li>情绪驱动</li><li>容易产生偏差</li></ul>
        </div>
        <div class="vs-badge">VS</div>
        <div class="system-card system2">
          <div class="sys-icon">🧐</div>
          <h3>系统2：慢思考</h3>
          <ul><li>刻意的、分析的</li><li>需要努力</li><li>理性驱动</li><li>能够纠正偏差</li></ul>
        </div>
      </div>
      <div class="action-area">
        <div class="usage-info" v-if="membershipStore.level !== 'admin'">
          <el-tag :type="usageInfo.remaining > 0 ? 'info' : 'danger'" size="large" effect="plain">
            本月已用 {{ usageInfo.usage }} / {{ usageInfo.limit === Infinity ? '∞' : usageInfo.limit }} 次
          </el-tag>
        </div>
        <el-button v-if="usageInfo.remaining > 0 || membershipStore.level === 'admin'" type="primary" size="large" round @click="startTraining" :loading="loading">开始训练 <el-icon><ArrowRight /></el-icon></el-button>
        <el-button v-else type="warning" size="large" round @click="$router.push('/upgrade')">立即升级 <el-icon><ArrowRight /></el-icon></el-button>
      </div>
      <UpgradePrompt v-if="showUpgrade" title="思维训练次数已用完" :sub-title="`当前等级：${membershipStore.levelLabel}，本月已使用 ${usageInfo.usage}/${usageInfo.limit} 次`" :usage-info="usageInfo" />
      <div class="history-section" v-if="store.history.length > 0">
        <h3>训练记录</h3>
        <div class="history-item" v-for="h in store.history.slice(0, 5)" :key="h.id" @click="$router.push(`/dual-system/result/${h.id}`)">
          <span>训练 #{{ h.id }}</span>
          <span>正确率 {{ h.total_questions > 0 ? Math.round(h.correct_count / h.total_questions * 100) : 0 }}%</span>
          <span>{{ h.created_at }}</span>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import AppLayout from '@/components/layout/AppLayout.vue'
import UpgradePrompt from '@/components/common/UpgradePrompt.vue'
import { useDualSystemStore } from '@/stores/dualSystem'
import { useMembershipStore } from '@/stores/membership'
import { useRouter } from 'vue-router'
import { onMounted, ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const store = useDualSystemStore()
const membershipStore = useMembershipStore()
const loading = ref(false)
const showUpgrade = ref(false)
const usageInfo = computed(() => membershipStore.getFeatureLimit('dual-system'))

onMounted(() => { store.loadHistory(); membershipStore.fetchLimits() })

async function startTraining() {
  loading.value = true
  try {
    await store.startTest()
    router.push('/dual-system/test')
  } catch (err) {
    if (err.response?.status === 403) { showUpgrade.value = true; membershipStore.fetchLimits() }
    else { ElMessage.error('启动训练失败，请稍后重试') }
  } finally { loading.value = false }
}
</script>

<style scoped>
.ds-index { max-width: 900px; margin: 0 auto; }
.page-header { text-align: center; margin-bottom: 36px; }
.page-title { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
.page-desc { font-size: 15px; color: var(--text-secondary); }
.systems-compare { display: flex; align-items: center; gap: 24px; margin-bottom: 36px; justify-content: center; }
.system-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 28px; flex: 1; max-width: 340px; }
.system1 { border-top: 4px solid #F97316; }
.system2 { border-top: 4px solid #2563EB; }
.sys-icon { font-size: 40px; margin-bottom: 12px; }
.system-card h3 { font-size: 18px; font-weight: 600; margin-bottom: 12px; }
.system-card ul { list-style: none; padding: 0; }
.system-card li { font-size: 14px; color: var(--text-secondary); padding: 4px 0; }
.system-card li::before { content: '• '; color: var(--primary); }
.vs-badge { font-size: 18px; font-weight: 700; color: var(--text-muted); background: var(--bg-primary); width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.action-area { text-align: center; margin-bottom: 48px; }
.history-section h3 { font-size: 18px; font-weight: 600; margin-bottom: 16px; }
.history-item { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 8px; margin-bottom: 8px; cursor: pointer; }
.history-item:hover { background: rgba(37,99,235,0.04); }
@media (max-width: 768px) { .systems-compare { flex-direction: column; } .vs-badge { transform: rotate(90deg); } }
</style>