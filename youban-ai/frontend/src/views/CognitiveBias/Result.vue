<template>
  <AppLayout>
    <div class="cb-result" v-if="store.results.length > 0">
      <div class="result-header">
        <h1>认知偏差扫描报告</h1>
        <p>基于《思考，快与慢》理论框架的认知偏差倾向分析</p>
      </div>
      <div class="bias-summary">
        <div class="summary-card" v-for="r in store.results" :key="r.id" :class="'level-' + r.level">
          <div class="bias-header">
            <span class="bias-name">{{ r.biasName }}</span>
            <el-tag :type="r.level === 'high' ? 'danger' : r.level === 'medium' ? 'warning' : 'success'" size="small">
              {{ r.level === 'high' ? '高倾向' : r.level === 'medium' ? '中倾向' : '低倾向' }}
            </el-tag>
          </div>
          <el-progress :percentage="r.score" :stroke-width="8" :color="r.level === 'high' ? '#F56C6C' : r.level === 'medium' ? '#E6A23C' : '#67C23A'" />
          <p class="bias-interpretation">{{ r.interpretation }}</p>
          <div class="bias-suggestions" v-if="r.suggestions.length > 0">
            <h4>改进建议</h4>
            <div class="suggestion-item" v-for="(s, i) in r.suggestions" :key="i">{{ i + 1 }}. {{ s }}</div>
          </div>
        </div>
      </div>
      <div class="result-actions">
        <el-button type="primary" round @click="$router.push('/cognitive-bias')">重新扫描</el-button>
        <el-button round @click="$router.push('/home')">返回首页</el-button>
      </div>
    </div>
    <div class="loading-state" v-else-if="store.loading"><el-icon :size="48" class="loading-icon"><Loading /></el-icon><p>加载报告数据中...</p></div>
    <div class="empty-state" v-else><el-empty description="未找到扫描结果" /></div>
  </AppLayout>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useCognitiveBiasStore } from '@/stores/cognitiveBias'
import AppLayout from '@/components/layout/AppLayout.vue'

const route = useRoute()
const store = useCognitiveBiasStore()

onMounted(async () => {
  const id = Number(route.params.id)
  if (id) await store.loadResult(id)
})
</script>

<style scoped>
.cb-result { max-width: 900px; margin: 0 auto; }
.result-header { text-align: center; margin-bottom: 36px; }
.result-header h1 { font-size: 28px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px; }
.result-header p { font-size: 15px; color: var(--text-secondary); }
.bias-summary { display: flex; flex-direction: column; gap: 16px; margin-bottom: 36px; }
.summary-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 24px; }
.summary-card.level-high { border-left: 4px solid #F56C6C; }
.summary-card.level-medium { border-left: 4px solid #E6A23C; }
.summary-card.level-low { border-left: 4px solid #67C23A; }
.bias-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.bias-name { font-size: 17px; font-weight: 600; color: var(--text-primary); }
.bias-interpretation { font-size: 14px; color: var(--text-secondary); margin-top: 12px; line-height: 1.6; }
.bias-suggestions { margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border); }
.bias-suggestions h4 { font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px; }
.suggestion-item { font-size: 13px; color: var(--text-secondary); padding: 4px 0; line-height: 1.6; }
.result-actions { display: flex; gap: 12px; justify-content: center; margin-top: 36px; }
.loading-state, .empty-state { text-align: center; padding: 80px 20px; }
.loading-icon { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
</style>