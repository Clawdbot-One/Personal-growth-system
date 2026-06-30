<template>
  <AppLayout>
    <div class="ds-index">
      <div class="page-header">
        <h1>🎲 决策辅助系统</h1>
        <p>基于期望值思维，用概率和理性分析辅助你做出更好的决策</p>
      </div>
      <div class="create-section">
        <h3>创建新决策</h3>
        <el-input v-model="title" placeholder="决策标题（如：是否换工作）" class="ds-input" />
        <el-input v-model="description" placeholder="描述决策背景..." type="textarea" :rows="3" class="ds-input" />
        <div class="options-editor">
          <span class="options-label">可选方案：</span>
          <div class="option-row" v-for="(opt, i) in options" :key="i">
            <el-input v-model="options[i]" :placeholder="'方案 ' + (i + 1)" size="small" />
            <el-button type="danger" :icon="Delete" circle size="small" @click="options.splice(i, 1)" :disabled="options.length <= 2" />
          </div>
          <el-button type="primary" link @click="options.push('')">+ 添加方案</el-button>
        </div>
        <el-button type="primary" @click="handleCreate" :loading="loading" :disabled="!title || options.some(o => !o)">创建决策</el-button>
      </div>
      <div class="decision-section" v-if="store.currentDecision">
        <h3>当前决策分析</h3>
        <div class="bias-warnings" v-if="store.currentDecision.biasesDetected?.length > 0">
          <el-alert v-for="b in store.currentDecision.biasesDetected" :key="b.name" :title="`检测到：${b.name} — ${b.question}`" type="warning" show-icon :closable="false" class="bias-alert" />
        </div>
        <div class="ev-list" v-if="store.analysisResult?.expectedValues">
          <div class="ev-item" v-for="ev in store.analysisResult.expectedValues" :key="ev.option">
            <div class="ev-header"><span>{{ ev.option }}</span><span class="ev-value" :class="{ positive: ev.expectedValue > 0 }">{{ ev.expectedValue > 0 ? '+' : '' }}{{ ev.expectedValue }}</span></div>
            <el-progress :percentage="ev.probability" :stroke-width="8" :color="ev.probability >= 70 ? '#67C23A' : ev.probability >= 40 ? '#E6A23C' : '#F56C6C'" />
            <div class="ev-meta"><span>成功概率 {{ ev.probability }}%</span><span>收益 {{ ev.winValue }}</span></div>
          </div>
        </div>
        <el-button type="success" @click="handleAnalyze" :loading="loading" v-if="!store.analysisResult">分析决策</el-button>
      </div>
      <div class="history-section" v-if="store.history.length > 0">
        <h3>历史决策</h3>
        <div class="history-item" v-for="d in store.history.slice(0, 10)" :key="d.id">
          <div class="h-title"><span>{{ d.title }}</span><el-tag size="small">{{ d.chosen_option ? '已完成' : '分析中' }}</el-tag></div>
          <div class="h-meta" v-if="d.chosen_option">选择：{{ d.chosen_option }} | 满意度：{{ d.satisfaction }}/5</div>
          <div class="h-date">{{ d.created_at }}</div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import AppLayout from '@/components/layout/AppLayout.vue'
import { useDecisionSupportStore } from '@/stores/decisionSupport'
import { ref, onMounted } from 'vue'
import { Delete } from '@element-plus/icons-vue'

const store = useDecisionSupportStore()
const title = ref('')
const description = ref('')
const options = ref(['方案A', '方案B'])
const loading = ref(false)

onMounted(() => { store.fetchHistory() })

async function handleCreate() {
  loading.value = true
  await store.create({ title: title.value, description: description.value, options: options.value.filter(Boolean) })
  loading.value = false
}

async function handleAnalyze() {
  if (!store.currentDecision) return
  loading.value = true
  await store.analyze(store.currentDecision.id)
  loading.value = false
}
</script>

<style scoped>
.ds-index { max-width: 800px; margin: 0 auto; }
.page-header { text-align: center; margin-bottom: 36px; }
.page-header h1 { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
.page-header p { font-size: 15px; color: var(--text-secondary); }
.create-section { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 24px; margin-bottom: 36px; }
.create-section h3 { font-size: 18px; font-weight: 600; margin-bottom: 16px; }
.ds-input { margin-bottom: 12px; }
.options-editor { margin-bottom: 16px; }
.options-label { font-size: 14px; font-weight: 500; display: block; margin-bottom: 8px; }
.option-row { display: flex; gap: 8px; align-items: center; margin-bottom: 8px; }
.decision-section { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 24px; margin-bottom: 36px; }
.decision-section h3 { font-size: 18px; font-weight: 600; margin-bottom: 16px; }
.bias-warnings { margin-bottom: 16px; }
.bias-alert { margin-bottom: 8px; }
.ev-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px; }
.ev-item { background: var(--bg-primary); border-radius: 8px; padding: 16px; }
.ev-header { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 15px; font-weight: 600; }
.ev-value { font-size: 20px; color: #F56C6C; }
.ev-value.positive { color: #67C23A; }
.ev-meta { display: flex; justify-content: space-between; margin-top: 6px; font-size: 12px; color: var(--text-muted); }
.history-section h3 { font-size: 18px; font-weight: 600; margin-bottom: 16px; }
.history-item { background: var(--bg-card); border: 1px solid var(--border); border-radius: 8px; padding: 14px 16px; margin-bottom: 8px; }
.h-title { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; font-size: 14px; font-weight: 500; }
.h-meta { font-size: 12px; color: var(--text-secondary); margin-bottom: 2px; }
.h-date { font-size: 11px; color: var(--text-muted); }
</style>
