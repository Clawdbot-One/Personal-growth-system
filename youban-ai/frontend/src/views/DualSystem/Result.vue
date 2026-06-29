<template>
  <AppLayout>
    <div class="ds-result" v-if="store.result">
      <div class="result-header">
        <h1>双系统思维训练报告</h1>
        <p>认知反思测试（CRT）结果分析</p>
      </div>
      <div class="stats-row">
        <div class="stat-card"><span class="stat-value">{{ store.result.accuracy }}%</span><span class="stat-label">正确率</span></div>
        <div class="stat-card system1-stat"><span class="stat-value">{{ store.result.system1Count }}</span><span class="stat-label">系统1 回答</span></div>
        <div class="stat-card system2-stat"><span class="stat-value">{{ store.result.system2Count }}</span><span class="stat-label">系统2 回答</span></div>
        <div class="stat-card"><span class="stat-value">{{ store.result.dominantSystem === 'system2' ? '系统2' : '系统1' }}</span><span class="stat-label">主导系统</span></div>
      </div>
      <div class="detail-section">
        <h3>答题详情</h3>
        <div class="detail-item" v-for="r in store.result.results" :key="r.id" :class="{ correct: r.isCorrect, wrong: !r.isCorrect }">
          <div class="detail-header">
            <span class="detail-q">Q{{ r.questionId }}. {{ r.questionText }}</span>
            <el-tag :type="r.isCorrect ? 'success' : 'danger'" size="small">{{ r.isCorrect ? '正确' : '错误' }}</el-tag>
          </div>
          <div class="detail-meta">
            <span>你的回答：{{ r.userAnswer }}</span>
            <span>正确答案：{{ r.correctAnswer }}</span>
            <span>思维模式：{{ r.thinkingMode === 'system2' ? '系统2（慢思考）' : '系统1（快思考）' }}</span>
          </div>
          <div class="detail-explanation" v-if="!r.isCorrect">{{ r.explanation }}</div>
        </div>
      </div>
      <div class="result-actions">
        <el-button type="primary" round @click="$router.push('/dual-system')">重新训练</el-button>
        <el-button round @click="$router.push('/home')">返回首页</el-button>
      </div>
    </div>
    <div class="loading-state" v-else-if="store.loading"><el-icon :size="48" class="loading-icon"><Loading /></el-icon><p>加载中...</p></div>
    <div class="empty-state" v-else><el-empty description="未找到训练记录" /></div>
  </AppLayout>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useDualSystemStore } from '@/stores/dualSystem'
import AppLayout from '@/components/layout/AppLayout.vue'

const route = useRoute()
const store = useDualSystemStore()

onMounted(async () => {
  const id = Number(route.params.id)
  if (id) await store.loadResult(id)
})
</script>

<style scoped>
.ds-result { max-width: 900px; margin: 0 auto; }
.result-header { text-align: center; margin-bottom: 36px; }
.result-header h1 { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
.result-header p { font-size: 15px; color: var(--text-secondary); }
.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 36px; }
.stat-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 24px; text-align: center; }
.system1-stat { border-top: 3px solid #F97316; }
.system2-stat { border-top: 3px solid #2563EB; }
.stat-value { font-size: 28px; font-weight: 700; display: block; margin-bottom: 4px; }
.stat-label { font-size: 13px; color: var(--text-muted); }
.detail-section h3 { font-size: 18px; font-weight: 600; margin-bottom: 16px; }
.detail-item { background: var(--bg-card); border: 1px solid var(--border); border-radius: 10px; padding: 20px; margin-bottom: 12px; }
.detail-item.correct { border-left: 4px solid #67C23A; }
.detail-item.wrong { border-left: 4px solid #F56C6C; }
.detail-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 8px; }
.detail-q { font-size: 15px; font-weight: 500; flex: 1; }
.detail-meta { display: flex; gap: 20px; font-size: 13px; color: var(--text-secondary); flex-wrap: wrap; }
.detail-explanation { margin-top: 12px; padding: 12px; background: rgba(37,99,235,0.04); border-radius: 8px; font-size: 13px; color: var(--text-secondary); line-height: 1.6; }
.result-actions { display: flex; gap: 12px; justify-content: center; margin-top: 36px; }
.loading-state, .empty-state { text-align: center; padding: 80px 20px; }
.loading-icon { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@media (max-width: 768px) { .stats-row { grid-template-columns: repeat(2, 1fr); } }
</style>