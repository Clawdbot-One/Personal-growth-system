<template>
  <AppLayout>
    <div class="cl-index">
      <div class="page-header">
        <h1>🧭 认知层次诊断</h1>
        <p>基于《认知红利》四个层次理论，定位你的认知水平与发展方向</p>
      </div>
      <div class="levels-grid">
        <div class="level-card" v-for="level in levels" :key="level.num">
          <div class="level-num" :style="{ background: level.color }">{{ level.num }}</div>
          <h3>{{ level.name }}</h3>
          <p>{{ level.desc }}</p>
        </div>
      </div>
      <div class="action-area">
        <el-button type="primary" size="large" round @click="startDiagnosis" :loading="loading">开始诊断 <el-icon><ArrowRight /></el-icon></el-button>
      </div>
      <div class="history-section" v-if="store.history.length > 0">
        <h3>历史诊断记录</h3>
        <div class="history-item" v-for="h in store.history.slice(0, 5)" :key="h.id" @click="$router.push(`/cognitive-level/result/${h.id}`)">
          <span>诊断 #{{ h.id }}</span><span>{{ h.created_at }}</span><el-icon><ArrowRight /></el-icon>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import AppLayout from '@/components/layout/AppLayout.vue'
import { useCognitiveLevelStore } from '@/stores/cognitiveLevel'
import { useRouter } from 'vue-router'
import { onMounted, ref } from 'vue'

const router = useRouter()
const store = useCognitiveLevelStore()
const loading = ref(false)

const levels = [
  { num: 1, name: '盲目自信区', desc: '不知道自己不知道——处于认知启蒙前阶段', color: '#F56C6C' },
  { num: 2, name: '觉醒学习区', desc: '知道自己不知道——意识到认知差距，开始学习', color: '#E6A23C' },
  { num: 3, name: '专业精通区', desc: '知道自己知道——掌握系统知识，能熟练运用', color: '#2563EB' },
  { num: 4, name: '融会贯通区', desc: '不知道自己知道——知识内化为直觉，自如运用', color: '#67C23A' },
]

onMounted(() => { store.loadHistory() })

async function startDiagnosis() {
  loading.value = true
  await store.startTest()
  loading.value = false
  router.push('/cognitive-level/test')
}
</script>

<style scoped>
.cl-index { max-width: 900px; margin: 0 auto; }
.page-header { text-align: center; margin-bottom: 36px; }
.page-header h1 { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
.page-header p { font-size: 15px; color: var(--text-secondary); }
.levels-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 36px; }
.level-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 24px; text-align: center; }
.level-num { width: 40px; height: 40px; border-radius: 50%; color: white; font-size: 18px; font-weight: 700; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; }
.level-card h3 { font-size: 16px; font-weight: 600; margin-bottom: 8px; }
.level-card p { font-size: 13px; color: var(--text-secondary); line-height: 1.5; }
.action-area { text-align: center; margin-bottom: 48px; }
.history-section h3 { font-size: 18px; font-weight: 600; margin-bottom: 16px; }
.history-item { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 8px; margin-bottom: 8px; cursor: pointer; }
.history-item:hover { background: rgba(37,99,235,0.04); }
@media (max-width: 768px) { .levels-grid { grid-template-columns: repeat(2, 1fr); } }
</style>