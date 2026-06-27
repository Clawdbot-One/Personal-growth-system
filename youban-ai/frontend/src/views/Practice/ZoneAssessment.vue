<template>
  <AppLayout>
    <div class="page-header">
      <h2>三区自适应难度分析</h2>
      <p class="subtitle">基于舒适区-学习区-恐慌区模型，确保你始终在最佳训练区间</p>
    </div>

    <div class="content-grid">
      <div class="main-col">
        <el-card class="section-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="card-title">三区分布仪表盘</span>
              <el-select v-model="selectedArea" style="width: 140px" size="small" @change="fetchZone">
                <el-option label="战略思维" value="战略思维" />
                <el-option label="学习能力" value="学习能力" />
                <el-option label="沟通表达" value="沟通表达" />
                <el-option label="责任担当" value="责任担当" />
                <el-option label="适应力" value="适应力" />
              </el-select>
            </div>
          </template>

          <div v-if="zoneData" class="zone-dashboard">
            <div class="zone-visual">
              <div class="zone-ring" ref="ringRef" style="height: 320px;"></div>
            </div>
            <div class="zone-detail">
              <div class="zone-status">
                <div class="zone-badge" :class="zoneData.currentZone">
                  <span class="zone-icon">{{ zoneIcon }}</span>
                  <span class="zone-text">{{ zoneLabel }}</span>
                </div>
                <p class="zone-advice">{{ zoneData.suggestion }}</p>
              </div>

              <div class="zone-stats">
                <div class="zone-stat">
                  <span class="zs-label">当前难度系数</span>
                  <span class="zs-value">{{ zoneData.difficultyLevel }}</span>
                </div>
                <div class="zone-stat">
                  <span class="zs-label">建议难度范围</span>
                  <span class="zs-value">{{ suggestedRange }}</span>
                </div>
              </div>

              <div class="zone-recent">
                <h4>近30天训练区分布</h4>
                <div class="zone-counts">
                  <div class="zc-item comfort">
                    <span class="zc-count">{{ zoneData.recentStats?.comfortSessions || 0 }}</span>
                    <span class="zc-label">舒适区</span>
                  </div>
                  <div class="zc-item learning">
                    <span class="zc-count">{{ zoneData.recentStats?.learningSessions || 0 }}</span>
                    <span class="zc-label">学习区</span>
                  </div>
                  <div class="zc-item panic">
                    <span class="zc-count">{{ zoneData.recentStats?.panicSessions || 0 }}</span>
                    <span class="zc-label">恐慌区</span>
                  </div>
                </div>
                <div class="learning-ratio">
                  <span>学习区占比：</span>
                  <el-progress :percentage="zoneData.recentStats?.learningZoneRatio || 0" :stroke-width="10" :color="ratioColor" />
                </div>
              </div>
            </div>
          </div>
          <el-empty v-else description="暂无数据" :image-size="80" />
        </el-card>

        <el-card class="section-card" shadow="never">
          <template #header>
            <span class="card-title">三区模型说明</span>
          </template>
          <div class="model-explanation">
            <div class="model-item comfort">
              <div class="model-header">
                <el-tag type="info" size="small">舒适区</el-tag>
                <span class="model-en">Comfort Zone</span>
              </div>
              <p>任务轻松、无挑战、可能感到无聊。在舒适区练习只能维持现有能力，无法获得实质性进步。</p>
              <p class="model-action">系统行为：检测到舒适区时，自动提升难度</p>
            </div>
            <div class="model-item learning">
              <div class="model-header">
                <el-tag type="success" size="small">学习区</el-tag>
                <span class="model-en">Learning Zone</span>
              </div>
              <p>适度挑战、需要专注、有成长的紧迫感。这是最大化能力提升速度的最佳区间。</p>
              <p class="model-action">系统行为：维持学习区，动态微调难度</p>
            </div>
            <div class="model-item panic">
              <div class="model-header">
                <el-tag type="danger" size="small">恐慌区</el-tag>
                <span class="model-en">Panic Zone</span>
              </div>
              <p>过度困难、焦虑、挫败感强烈。可能导致放弃，练习效率低下。</p>
              <p class="model-action">系统行为：降低难度或提供更多支持</p>
            </div>
          </div>
        </el-card>
      </div>

      <div class="side-col">
        <el-card class="section-card" shadow="never">
          <template #header>
            <span class="card-title">难度调节建议</span>
          </template>
          <div class="advice-list">
            <div class="advice-item" v-if="zoneData?.currentZone === 'comfort'">
              <el-icon color="#F59E0B"><WarningFilled /></el-icon>
              <div>
                <strong>提升挑战</strong>
                <p>尝试略超出当前能力的任务，选择"感到有些吃力但能完成"的难度级别</p>
              </div>
            </div>
            <div class="advice-item" v-if="zoneData?.currentZone === 'learning'">
              <el-icon color="#10B981"><SuccessFilled /></el-icon>
              <div>
                <strong>保持节奏</strong>
                <p>当前处于最佳训练区间，每次聚焦一个小改进点，持续积累</p>
              </div>
            </div>
            <div class="advice-item" v-if="zoneData?.currentZone === 'panic'">
              <el-icon color="#F56C6C"><CircleCloseFilled /></el-icon>
              <div>
                <strong>降低难度</strong>
                <p>先拆解任务，逐个击破，或寻求 AI 导师的帮助</p>
              </div>
            </div>
            <div class="advice-item">
              <el-icon color="#2563EB"><InfoFilled /></el-icon>
              <div>
                <strong>渐进式突破</strong>
                <p>每次只比当前能力高一小步，稳定的进步好过冲击性的波动</p>
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import * as echarts from 'echarts'
import { WarningFilled, SuccessFilled, CircleCloseFilled, InfoFilled } from '@element-plus/icons-vue'
import request from '@/api/request.js'
import AppLayout from '@/components/layout/AppLayout.vue'

const selectedArea = ref('战略思维')
const zoneData = ref(null)
const ringRef = ref(null)
let ringInstance = null

const zoneIcon = computed(() => {
  if (zoneData.value?.currentZone === 'comfort') return '😌'
  if (zoneData.value?.currentZone === 'learning') return '🚀'
  return '😰'
})

const zoneLabel = computed(() => {
  if (zoneData.value?.currentZone === 'comfort') return '舒适区'
  if (zoneData.value?.currentZone === 'learning') return '学习区'
  return '恐慌区'
})

const suggestedRange = computed(() => {
  const d = zoneData.value?.difficultyLevel || 1.0
  return `${Math.max(0.1, (d - 0.2).toFixed(1))} - ${(d + 0.2).toFixed(1)}`
})

const ratioColor = computed(() => {
  const r = zoneData.value?.recentStats?.learningZoneRatio || 0
  if (r >= 60) return '#10B981'
  if (r >= 30) return '#F59E0B'
  return '#F56C6C'
})

async function fetchZone() {
  try {
    const res = await request.get('/dp/zone', { params: { area: selectedArea.value } })
    if (res.code === 0) {
      zoneData.value = res.data
      await nextTick()
      renderRing()
    }
  } catch { /* ignore */ }
}

function renderRing() {
  if (!ringRef.value || !zoneData.value) return
  if (ringInstance) ringInstance.dispose()
  ringInstance = echarts.init(ringRef.value)

  const { comfortZoneScore, learningZoneScore, panicZoneScore } = zoneData.value
  const option = {
    tooltip: { trigger: 'item' },
    legend: { bottom: 0 },
    series: [{
      type: 'pie',
      radius: ['55%', '80%'],
      center: ['50%', '45%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 3 },
      label: { show: true, position: 'outside', formatter: '{b}\n{d}%' },
      data: [
        { value: comfortZoneScore, name: '舒适区', itemStyle: { color: '#909399' } },
        { value: learningZoneScore, name: '学习区', itemStyle: { color: '#10B981' } },
        { value: panicZoneScore, name: '恐慌区', itemStyle: { color: '#F56C6C' } },
      ],
    }],
  }
  ringInstance.setOption(option)
}

onMounted(fetchZone)
watch(selectedArea, fetchZone)
</script>

<style scoped>
.page-header { margin-bottom: 20px; }
.page-header h2 { font-size: 22px; font-weight: 700; color: #303133; margin: 0; }
.subtitle { color: #909399; font-size: 14px; margin-top: 4px; }

.content-grid { display: grid; grid-template-columns: 1fr 360px; gap: 20px; }
.section-card { margin-bottom: 20px; }
.section-card :deep(.el-card__header) { padding: 14px 20px; border-bottom: 1px solid #ebeef5; }
.section-card :deep(.el-card__body) { padding: 20px; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.card-title { font-size: 15px; font-weight: 600; color: #303133; }

.zone-dashboard { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
.zone-status { text-align: center; margin-bottom: 20px; }
.zone-badge { display: inline-flex; align-items: center; gap: 8px; padding: 12px 24px; border-radius: 12px; font-size: 18px; font-weight: 700; }
.zone-badge.comfort { background: rgba(144,147,153,0.1); color: #606266; }
.zone-badge.learning { background: rgba(16,185,129,0.1); color: #059669; }
.zone-badge.panic { background: rgba(245,108,108,0.1); color: #DC2626; }
.zone-icon { font-size: 28px; }
.zone-advice { font-size: 13px; color: #909399; margin-top: 8px; }

.zone-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; }
.zone-stat { text-align: center; padding: 12px; background: #f5f7fa; border-radius: 8px; }
.zs-label { font-size: 12px; color: #909399; display: block; }
.zs-value { font-size: 20px; font-weight: 700; color: #303133; }

.zone-recent h4 { font-size: 14px; font-weight: 600; color: #303133; margin: 0 0 10px; }
.zone-counts { display: flex; gap: 8px; margin-bottom: 12px; }
.zc-item { flex: 1; text-align: center; padding: 10px; border-radius: 8px; }
.zc-item.comfort { background: rgba(144,147,153,0.08); }
.zc-item.learning { background: rgba(16,185,129,0.08); }
.zc-item.panic { background: rgba(245,108,108,0.08); }
.zc-count { font-size: 22px; font-weight: 700; display: block; }
.zc-label { font-size: 12px; color: #909399; }
.learning-ratio { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #606266; }

.model-explanation { display: flex; flex-direction: column; gap: 16px; }
.model-item { padding: 16px; border-radius: 10px; border-left: 3px solid; }
.model-item.comfort { border-left-color: #909399; background: rgba(144,147,153,0.04); }
.model-item.learning { border-left-color: #10B981; background: rgba(16,185,129,0.04); }
.model-item.panic { border-left-color: #F56C6C; background: rgba(245,108,108,0.04); }
.model-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.model-en { font-size: 12px; color: #909399; }
.model-item p { font-size: 13px; color: #606266; margin: 0 0 4px; line-height: 1.6; }
.model-action { font-size: 12px; color: #2563EB; font-weight: 500; }

.advice-list { display: flex; flex-direction: column; gap: 12px; }
.advice-item { display: flex; gap: 10px; padding: 12px; background: #f5f7fa; border-radius: 8px; }
.advice-item strong { font-size: 13px; color: #303133; display: block; }
.advice-item p { font-size: 12px; color: #909399; margin: 4px 0 0; }

@media (max-width: 768px) {
  .content-grid { grid-template-columns: 1fr; }
  .zone-dashboard { grid-template-columns: 1fr; }
}
</style>