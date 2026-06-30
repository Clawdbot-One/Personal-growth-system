<template>
  <AppLayout>
    <div class="cl-result" v-if="store.results.length > 0">
      <div class="result-header"><h1>认知层次诊断报告</h1><p>基于《认知红利》四层次模型的分析</p></div>
      <div class="result-grid">
        <div class="result-card" v-for="r in store.results" :key="r.id" :class="'level-' + r.level">
          <div class="r-header">
            <span class="r-name">{{ r.dimension_name }}</span>
            <el-tag :type="r.level >= 3 ? 'success' : r.level >= 2 ? '' : r.level >= 1 ? 'warning' : 'danger'" size="small">{{ r.level_name }}</el-tag>
          </div>
          <el-progress :percentage="r.score" :stroke-width="10" :color="r.level >= 3 ? '#67C23A' : r.level >= 2 ? '#2563EB' : r.level >= 1 ? '#E6A23C' : '#F56C6C'" />
          <div class="r-tips" v-if="r.breakthrough_tips.length > 0">
            <h4>突破建议</h4>
            <div class="tip-item" v-for="(t, i) in r.breakthrough_tips" :key="i">{{ t }}</div>
          </div>
        </div>
      </div>
      <div class="result-actions">
        <el-button type="primary" round @click="$router.push('/cognitive-level')">重新诊断</el-button>
        <el-button round @click="$router.push('/home')">返回首页</el-button>
      </div>
    </div>
    <div class="loading-state" v-else-if="store.loading"><el-icon :size="48" class="loading-icon"><Loading /></el-icon><p>加载中...</p></div>
    <div class="empty-state" v-else><el-empty description="未找到诊断结果" /></div>
  </AppLayout>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useCognitiveLevelStore } from '@/stores/cognitiveLevel'
import AppLayout from '@/components/layout/AppLayout.vue'

const route = useRoute()
const store = useCognitiveLevelStore()

onMounted(async () => {
  const id = Number(route.params.id)
  if (id) await store.loadResult(id)
})
</script>

<style scoped>
.cl-result { max-width: 900px; margin: 0 auto; }
.result-header { text-align: center; margin-bottom: 36px; }
.result-header h1 { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
.result-header p { font-size: 15px; color: var(--text-secondary); }
.result-grid { display: flex; flex-direction: column; gap: 16px; margin-bottom: 36px; }
.result-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 24px; }
.result-card.level-3 { border-left: 4px solid #67C23A; }
.result-card.level-2 { border-left: 4px solid #2563EB; }
.result-card.level-1 { border-left: 4px solid #E6A23C; }
.result-card.level-0 { border-left: 4px solid #F56C6C; }
.r-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.r-name { font-size: 17px; font-weight: 600; }
.r-tips { margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border); }
.r-tips h4 { font-size: 14px; font-weight: 600; margin-bottom: 8px; }
.tip-item { font-size: 13px; color: var(--text-secondary); padding: 3px 0; }
.result-actions { display: flex; gap: 12px; justify-content: center; margin-top: 36px; }
.loading-state, .empty-state { text-align: center; padding: 80px 20px; }
.loading-icon { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
</style>