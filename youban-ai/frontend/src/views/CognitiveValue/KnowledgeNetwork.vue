<template>
  <AppLayout>
    <div class="kn-index">
      <div class="page-header">
        <h1>🕸️ 知识网络</h1>
        <p>构建你的个人知识图谱，识别知识缺口，优化学习路径</p>
      </div>
      <div class="stats-row" v-if="store.stats">
        <div class="stat-card"><span class="stat-value">{{ store.stats.totalNodes }}</span><span class="stat-label">知识节点</span></div>
        <div class="stat-card mastered"><span class="stat-value">{{ store.stats.mastered }}</span><span class="stat-label">已掌握</span></div>
        <div class="stat-card learning"><span class="stat-value">{{ store.stats.learning }}</span><span class="stat-label">学习中</span></div>
        <div class="stat-card tolearn"><span class="stat-value">{{ store.stats.toLearn }}</span><span class="stat-label">待学习</span></div>
        <div class="stat-card"><span class="stat-value">{{ store.stats.avgMastery }}%</span><span class="stat-label">平均掌握度</span></div>
      </div>
      <div class="path-section" v-if="store.stats?.availablePaths?.length > 0">
        <h3>推荐学习路径</h3>
        <div class="path-item" v-for="p in store.stats.availablePaths" :key="p.target">
          <div class="path-target"><el-icon><Aim /></el-icon> {{ p.target }}</div>
          <div class="path-steps">
            <span v-for="(s, i) in p.path" :key="s" class="step-node">
              {{ s }}<span v-if="i < p.path.length - 1" class="step-arrow">→</span>
            </span>
          </div>
          <span class="path-count">共 {{ p.steps }} 步</span>
        </div>
      </div>
      <div class="nodes-section">
        <h3>知识节点</h3>
        <div class="nodes-grid">
          <div class="node-card" v-for="n in store.nodes" :key="n.name" :class="'status-' + n.status" @click="cycleStatus(n)">
            <div class="node-header">
              <span class="node-name">{{ n.name }}</span>
              <el-tag :type="n.status === 'mastered' ? 'success' : n.status === 'learning' ? '' : 'info'" size="small">
                {{ n.status === 'mastered' ? '已掌握' : n.status === 'learning' ? '学习中' : '待学习' }}
              </el-tag>
            </div>
            <el-progress :percentage="n.mastery" :stroke-width="6" :color="n.status === 'mastered' ? '#67C23A' : n.status === 'learning' ? '#2563EB' : '#909399'" />
            <div class="node-category">{{ n.category }}</div>
            <div class="node-relations" v-if="n.prerequisites?.length > 0">
              <span class="rel-label">前置：</span>
              <el-tag v-for="pre in n.prerequisites" :key="pre" size="small" type="info">{{ pre }}</el-tag>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import AppLayout from '@/components/layout/AppLayout.vue'
import { useKnowledgeNetworkStore } from '@/stores/knowledgeNetwork'
import { onMounted } from 'vue'

const store = useKnowledgeNetworkStore()

onMounted(() => { store.fetchNetwork() })

function cycleStatus(node) {
  const statuses = ['to_learn', 'learning', 'mastered']
  const idx = statuses.indexOf(node.status)
  const nextStatus = statuses[(idx + 1) % statuses.length]
  const mastery = nextStatus === 'mastered' ? 90 : nextStatus === 'learning' ? 50 : 20
  store.updateNode(node.name, mastery, nextStatus)
}
</script>

<style scoped>
.kn-index { max-width: 1000px; margin: 0 auto; }
.page-header { text-align: center; margin-bottom: 36px; }
.page-header h1 { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
.page-header p { font-size: 15px; color: var(--text-secondary); }
.stats-row { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-bottom: 36px; }
.stat-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 18px; text-align: center; }
.stat-card.mastered { border-top: 3px solid #67C23A; }
.stat-card.learning { border-top: 3px solid #2563EB; }
.stat-card.tolearn { border-top: 3px solid #909399; }
.stat-value { font-size: 24px; font-weight: 700; display: block; margin-bottom: 4px; }
.stat-label { font-size: 12px; color: var(--text-muted); }
.kn-index h3 { font-size: 18px; font-weight: 600; margin: 24px 0 16px; }
.path-section { margin-bottom: 36px; }
.path-item { background: var(--bg-card); border: 1px solid var(--border); border-radius: 10px; padding: 18px; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
.path-target { font-size: 15px; font-weight: 600; display: flex; align-items: center; gap: 6px; }
.path-steps { font-size: 13px; color: var(--text-secondary); display: flex; align-items: center; gap: 4px; flex-wrap: wrap; }
.step-node { background: rgba(37,99,235,0.06); padding: 3px 10px; border-radius: 4px; }
.step-arrow { color: var(--text-muted); margin: 0 2px; }
.path-count { font-size: 13px; color: var(--text-muted); }
.nodes-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 12px; }
.node-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 10px; padding: 16px; cursor: pointer; transition: all 0.2s; }
.node-card:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
.node-card.status-mastered { border-left: 4px solid #67C23A; }
.node-card.status-learning { border-left: 4px solid #2563EB; }
.node-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.node-name { font-size: 15px; font-weight: 600; }
.node-category { font-size: 12px; color: var(--text-muted); margin-top: 8px; }
.node-relations { margin-top: 8px; display: flex; align-items: center; gap: 4px; flex-wrap: wrap; }
.rel-label { font-size: 12px; color: var(--text-muted); }
@media (max-width: 768px) { .stats-row { grid-template-columns: repeat(3, 1fr); } .nodes-grid { grid-template-columns: 1fr; } }
</style>
