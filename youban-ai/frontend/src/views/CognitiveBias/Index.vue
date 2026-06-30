<template>
  <AppLayout>
    <div class="cb-index">
      <div class="page-header">
        <h1 class="page-title">🧠 认知偏差扫描仪</h1>
        <p class="page-desc">基于《思考，快与慢》理论，检测你的认知偏差倾向，提升决策质量</p>
      </div>
      <div class="bias-grid">
        <div class="bias-card" v-for="bias in biasTypes" :key="bias.type">
          <div class="bias-icon">{{ bias.icon }}</div>
          <h3>{{ bias.name }}</h3>
          <p>{{ bias.desc }}</p>
        </div>
      </div>
      <div class="action-area">
        <div class="usage-info" v-if="membershipStore.level !== 'admin'">
          <el-tag :type="usageInfo.remaining > 0 ? 'info' : 'danger'" size="large" effect="plain">
            本月已用 {{ usageInfo.usage }} / {{ usageInfo.limit === Infinity ? '∞' : usageInfo.limit }} 次
            <span v-if="usageInfo.remaining === 0">（已达上限）</span>
          </el-tag>
        </div>
        <el-button
          v-if="usageInfo.remaining > 0 || membershipStore.level === 'admin'"
          type="primary" size="large" round @click="startScan" :loading="loading"
        >
          开始扫描 <el-icon><ArrowRight /></el-icon>
        </el-button>
        <el-button v-else type="warning" size="large" round @click="$router.push('/upgrade')">
          立即升级 <el-icon><ArrowRight /></el-icon>
        </el-button>
      </div>
      <UpgradePrompt
        v-if="showUpgrade"
        title="认知偏差扫描次数已用完"
        :sub-title="`当前等级：${membershipStore.levelLabel}，本月已使用 ${usageInfo.usage}/${usageInfo.limit} 次`"
        :usage-info="usageInfo"
      />
      <div class="history-section" v-if="store.history.length > 0">
        <h3>历史扫描记录</h3>
        <div class="history-item" v-for="h in store.history.slice(0, 5)" :key="h.id" @click="$router.push(`/cognitive-bias/result/${h.id}`)">
          <span>扫描记录 #{{ h.id }}</span>
          <span>{{ h.created_at }}</span>
          <el-icon><ArrowRight /></el-icon>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import AppLayout from '@/components/layout/AppLayout.vue'
import UpgradePrompt from '@/components/common/UpgradePrompt.vue'
import { useCognitiveBiasStore } from '@/stores/cognitiveBias'
import { useMembershipStore } from '@/stores/membership'
import { useRouter } from 'vue-router'
import { onMounted, ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const store = useCognitiveBiasStore()
const membershipStore = useMembershipStore()
const loading = ref(false)
const showUpgrade = ref(false)

const usageInfo = computed(() => membershipStore.getFeatureLimit('cognitive-bias'))

const biasTypes = [
  { type: 'anchoring', name: '锚定效应', icon: '⚓', desc: '决策时过度依赖最先获得的信息' },
  { type: 'availability', name: '可得性偏差', icon: '📰', desc: '根据容易回忆的事例判断概率' },
  { type: 'confirmation', name: '确认偏误', icon: '🔍', desc: '倾向于寻找支持已有信念的信息' },
  { type: 'overconfidence', name: '过度自信', icon: '🎯', desc: '系统性地高估自己的能力和判断' },
  { type: 'lossAversion', name: '损失厌恶', icon: '⚖️', desc: '对损失的敏感远高于等量收益' },
  { type: 'framing', name: '框架效应', icon: '🪟', desc: '表述方式影响决策选择' },
  { type: 'halo', name: '光环效应', icon: '✨', desc: '因某一特征而过度泛化判断' },
]

onMounted(() => {
  store.loadHistory()
  membershipStore.fetchLimits()
})

async function startScan() {
  loading.value = true
  try {
    await store.startTest()
    router.push('/cognitive-bias/test')
  } catch (err) {
    if (err.response?.status === 403) {
      showUpgrade.value = true
      membershipStore.fetchLimits()
    } else {
      ElMessage.error('启动扫描失败，请稍后重试')
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.cb-index { max-width: 1000px; margin: 0 auto; }
.page-header { margin-bottom: 36px; }
.page-title { font-size: 28px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px; }
.page-desc { font-size: 15px; color: var(--text-secondary); }
.bias-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; margin-bottom: 36px; }
.bias-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 24px; transition: all 0.3s; }
.bias-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
.bias-icon { font-size: 32px; margin-bottom: 12px; }
.bias-card h3 { font-size: 17px; font-weight: 600; margin-bottom: 8px; color: var(--text-primary); }
.bias-card p { font-size: 13px; color: var(--text-secondary); line-height: 1.6; }
.action-area { text-align: center; margin-bottom: 48px; }
.history-section { margin-top: 36px; }
.history-section h3 { font-size: 18px; font-weight: 600; margin-bottom: 16px; }
.history-item { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 8px; margin-bottom: 8px; cursor: pointer; transition: background 0.2s; }
.history-item:hover { background: rgba(37,99,235,0.04); }
@media (max-width: 768px) { .bias-grid { grid-template-columns: 1fr; } }
</style>