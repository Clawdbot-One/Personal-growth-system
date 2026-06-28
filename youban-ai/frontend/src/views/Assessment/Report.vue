<template>
  <AppLayout>
    <div class="report-page" v-if="report" ref="reportContainer">
      <!-- 报告头部 -->
      <div class="report-header">
        <div class="report-header-top">
          <button class="back-btn" @click="$router.back()">
            <el-icon><ArrowLeft /></el-icon>
          </button>
          <div class="report-title-area">
            <h1 class="report-title">优势测评报告</h1>
            <span class="report-type-badge" :style="{ background: typeColor }">
              {{ typeLabel }}
            </span>
          </div>
          <div class="report-actions">
            <el-button round @click="handleShare">
              <el-icon><Share /></el-icon>
              分享
            </el-button>
            <el-button type="primary" round @click="handleExport">
              <el-icon><Download /></el-icon>
              导出报告
            </el-button>
          </div>
        </div>
        <div class="report-meta">
          <span class="report-date">测评时间：{{ formatDate(report.createdAt) }}</span>
          <span class="report-id">报告编号：#{{ report.id }}</span>
        </div>
      </div>

      <!-- 四维雷达图 -->
      <div class="report-section">
        <h2 class="section-title">
          <el-icon><TrendCharts /></el-icon>
          四维能力图谱
        </h2>
        <div class="radar-chart-container">
          <div class="radar-chart-wrapper">
            <svg viewBox="0 0 400 400" class="radar-svg">
              <!-- 背景网格 -->
              <polygon
                v-for="level in 5"
                :key="level"
                :points="getRadarPoints(level * 20)"
                fill="none"
                :stroke="level === 5 ? 'var(--border)' : 'var(--border)'"
                :stroke-width="level === 5 ? 1.5 : 0.5"
                :opacity="0.5"
              />
              <!-- 轴线 -->
              <line
                v-for="(axis, i) in radarAxes"
                :key="'axis-' + i"
                :x1="200"
                :y1="200"
                :x2="axis.x"
                :y2="axis.y"
                stroke="var(--border)"
                stroke-width="1"
                opacity="0.5"
              />
              <!-- 数据区域 -->
              <polygon
                :points="getRadarDataPoints()"
                fill="rgba(37, 99, 235, 0.15)"
                stroke="var(--primary)"
                stroke-width="2.5"
                stroke-linejoin="round"
              />
              <!-- 数据点 -->
              <circle
                v-for="(point, i) in radarDataPoints"
                :key="'dot-' + i"
                :cx="point.x"
                :cy="point.y"
                r="5"
                fill="var(--primary)"
                stroke="white"
                stroke-width="2"
              />
              <!-- 标签 -->
              <text
                v-for="(label, i) in radarLabels"
                :key="'label-' + i"
                :x="label.x"
                :y="label.y"
                text-anchor="middle"
                dominant-baseline="middle"
                :fill="radarColors[i]"
                font-size="14"
                font-weight="600"
              >
                {{ label.text }}
              </text>
              <!-- 分数标签 -->
              <text
                v-for="(point, i) in radarDataPoints"
                :key="'score-' + i"
                :x="point.labelX"
                :y="point.labelY"
                text-anchor="middle"
                dominant-baseline="middle"
                fill="var(--primary)"
                font-size="13"
                font-weight="700"
              >
                {{ scoreValues[i] }}
              </text>
            </svg>
          </div>
          <div class="radar-legend">
            <div class="legend-item" v-for="(item, i) in dimensionLegend" :key="item.key">
              <span class="legend-dot" :style="{ background: radarColors[i] }"></span>
              <span class="legend-label">{{ item.label }}</span>
              <span class="legend-score">{{ item.score }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 四维分数卡片 -->
      <div class="report-section">
        <h2 class="section-title">
          <el-icon><DataAnalysis /></el-icon>
          各维度得分
        </h2>
        <div class="score-cards">
          <div
            class="score-card"
            v-for="dim in dimensionCards"
            :key="dim.key"
            :style="{ borderTopColor: dim.color }"
          >
            <div class="score-card-header">
              <span class="score-card-icon">{{ dim.icon }}</span>
              <span class="score-card-label">{{ dim.label }}</span>
            </div>
            <div class="score-card-value" :style="{ color: dim.color }">
              {{ dim.score }}
              <span class="score-card-unit">分</span>
            </div>
            <el-progress
              :percentage="dim.score"
              :stroke-width="8"
              :color="dim.color"
              :show-text="false"
            />
            <p class="score-card-desc">{{ dim.desc }}</p>
          </div>
        </div>
      </div>

      <!-- TOP5 优势 -->
      <div class="report-section">
        <h2 class="section-title">
          <el-icon><StarFilled /></el-icon>
          TOP5 核心优势
        </h2>
        <div class="strengths-grid">
          <div
            class="strength-card"
            v-for="(s, idx) in report.topStrengths"
            :key="s.name"
          >
            <div class="strength-rank" :style="{ background: s.color }">#{{ idx + 1 }}</div>
            <div class="strength-content">
              <div class="strength-header">
                <span class="strength-icon">{{ s.icon }}</span>
                <h3 class="strength-name">{{ s.name }}</h3>
              </div>
              <p class="strength-desc">{{ s.desc }}</p>
              <div class="strength-traits">
                <el-tag
                  v-for="trait in s.traits.split('、')"
                  :key="trait"
                  size="small"
                  effect="plain"
                  :color="s.color"
                  round
                >
                  {{ trait }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 盲区与成长建议 -->
      <div class="report-section">
        <h2 class="section-title">
          <el-icon><WarningFilled /></el-icon>
          盲区识别与成长建议
        </h2>
        <div class="blind-spots">
          <div class="blind-card" v-for="spot in report.blindSpots" :key="spot">
            <div class="blind-header">
              <el-icon><Warning /></el-icon>
              <span>{{ spot }}</span>
            </div>
            <p class="blind-suggestion">
              {{
                spot === '时间管理'
                  ? '建议使用番茄工作法，将大任务拆解为25分钟的小单元，逐步提升时间利用效率。'
                  : '建议建立压力应对机制，如冥想、运动或定期复盘，培养更积极的心态面对挑战。'
              }}
            </p>
          </div>
        </div>
      </div>

      <!-- 职业推荐 -->
      <div class="report-section">
        <h2 class="section-title">
          <el-icon><Suitcase /></el-icon>
          职业方向推荐
        </h2>
        <div class="career-list">
          <div
            class="career-item"
            v-for="(rec, idx) in report.recommendations"
            :key="rec.career"
          >
            <div class="career-rank">#{{ idx + 1 }}</div>
            <div class="career-info">
              <h4 class="career-name">{{ rec.career }}</h4>
              <div class="career-match-bar">
                <div
                  class="career-match-fill"
                  :style="{ width: rec.match + '%', background: matchColor(rec.match) }"
                ></div>
              </div>
            </div>
            <div class="career-match-value" :style="{ color: matchColor(rec.match) }">
              {{ rec.match }}%
            </div>
          </div>
        </div>
      </div>

      <!-- 底部操作 -->
      <div class="report-footer">
        <el-button type="primary" size="large" round @click="handleExport">
          <el-icon><Download /></el-icon>
          导出完整报告 (PDF)
        </el-button>
        <el-button size="large" round @click="handleShare">
          <el-icon><Share /></el-icon>
          分享给好友
        </el-button>
        <router-link to="/growth">
          <el-button size="large" round class="growth-btn">
            <el-icon><TrendCharts /></el-icon>
            查看成长规划
          </el-button>
        </router-link>
      </div>
    </div>

    <!-- 加载中 -->
    <div class="loading-state" v-else>
      <el-icon :size="48" class="loading-icon"><Loading /></el-icon>
      <p>加载报告数据中...</p>
    </div>
  </AppLayout>
</template>

<script setup>
import { computed, onMounted, ref, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAssessmentStore } from '@/stores/assessment'
import { ElMessage, ElLoading } from 'element-plus'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import AppLayout from '@/components/layout/AppLayout.vue'

const route = useRoute()
const router = useRouter()
const store = useAssessmentStore()

const report = ref(null)
const reportContainer = ref(null)

onMounted(() => {
  const id = Number(route.params.id)
  const found = store.reports.find(r => r.id === id)
  if (found) {
    report.value = found
  } else {
    // 如果找不到报告，生成一个模拟报告
    report.value = store.generateReport('quick')
  }
})

const typeLabel = computed(() => {
  const map = { quick: '快速精简版', full: '专业完整版', interview: '深度访谈版' }
  return map[report.value?.type] || '测评报告'
})
const typeColor = computed(() => {
  const map = { quick: '#2563EB', full: '#7C3AED', interview: '#F97316' }
  return map[report.value?.type] || '#2563EB'
})

const scoreValues = computed(() => {
  if (!report.value) return [0, 0, 0, 0]
  const s = report.value.scores
  return [s.talent, s.skill, s.character, s.value]
})

const radarColors = ['#2563EB', '#7C3AED', '#059669', '#F97316']
const radarLabels = computed(() => [
  { text: '天赋', x: 200, y: 38 },
  { text: '技能', x: 355, y: 200 },
  { text: '价值观', x: 200, y: 362 },
  { text: '性格', x: 45, y: 200 },
])

const radarAxes = computed(() => {
  const cx = 200, cy = 200, r = 150
  return [
    { x: cx, y: cy - r },        // 上
    { x: cx + r, y: cy },        // 右
    { x: cx, y: cy + r },        // 下
    { x: cx - r, y: cy },        // 左
  ]
})

function getRadarPoints(level) {
  const cx = 200, cy = 200, r = (level / 100) * 150
  const angles = [-Math.PI / 2, 0, Math.PI / 2, Math.PI]
  return angles.map(a => `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`).join(' ')
}

const radarDataPoints = computed(() => {
  const cx = 200, cy = 200
  const angles = [-Math.PI / 2, 0, Math.PI / 2, Math.PI]
  return scoreValues.value.map((score, i) => {
    const r = (score / 100) * 150
    const x = cx + r * Math.cos(angles[i])
    const y = cy + r * Math.sin(angles[i])
    const offset = 18
    let labelX = x, labelY = y
    if (i === 0) labelY -= offset
    if (i === 1) labelX += offset
    if (i === 2) labelY += offset
    if (i === 3) labelX -= offset
    return { x, y, labelX, labelY }
  })
})

function getRadarDataPoints() {
  return radarDataPoints.value.map(p => `${p.x},${p.y}`).join(' ')
}

const dimensionLegend = computed(() => [
  { key: 'talent', label: '天赋', score: scoreValues.value[0] },
  { key: 'skill', label: '技能', score: scoreValues.value[1] },
  { key: 'value', label: '价值观', score: scoreValues.value[2] },
  { key: 'character', label: '性格', score: scoreValues.value[3] },
])

const dimensionCards = computed(() => [
  { key: 'talent', label: '天赋', icon: '🧠', score: scoreValues.value[0], color: '#2563EB', desc: '你的天赋领域表现出色，拥有较强的分析和战略思维能力。' },
  { key: 'skill', label: '技能', icon: '🛠️', score: scoreValues.value[1], color: '#7C3AED', desc: '技能水平良好，具备扎实的实践能力和学习迁移能力。' },
  { key: 'character', label: '性格', icon: '💎', score: scoreValues.value[2], color: '#059669', desc: '性格特质积极向上，拥有责任感、适应力和坚韧品质。' },
  { key: 'value', label: '价值观', icon: '🎯', score: scoreValues.value[3], color: '#F97316', desc: '价值观清晰明确，追求成长、意义和积极的社会影响力。' },
])

function matchColor(match) {
  if (match >= 90) return '#059669'
  if (match >= 80) return '#2563EB'
  return '#F97316'
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

async function handleExport() {
  if (!reportContainer.value) {
    ElMessage.warning('报告内容未加载')
    return
  }

  const loading = ElLoading.service({
    lock: true,
    text: '正在生成PDF报告...',
    background: 'rgba(0, 0, 0, 0.7)',
  })

  try {
    // 隐藏导出按钮和其他交互元素
    const exportButtons = reportContainer.value.querySelectorAll('.report-actions, .report-footer, .back-btn')
    exportButtons.forEach(el => el.style.display = 'none')

    await nextTick()

    const canvas = await html2canvas(reportContainer.value, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
    })

    // 恢复按钮
    exportButtons.forEach(el => el.style.display = '')

    const imgWidth = 210 // A4 width in mm
    const pageHeight = 297 // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight

    const pdf = new jsPDF('p', 'mm', 'a4')
    let position = 0

    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    while (heightLeft > 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    const typeName = report.value?.type === 'quick' ? '快速精简版' : report.value?.type === 'full' ? '专业完整版' : '深度访谈版'
    pdf.save(`优伴AI_优势测评报告_${typeName}_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.pdf`)

    ElMessage.success('报告导出成功！')
  } catch (err) {
    // 恢复按钮
    const exportButtons = reportContainer.value.querySelectorAll('.report-actions, .report-footer, .back-btn')
    exportButtons.forEach(el => el.style.display = '')
    console.error('导出PDF失败:', err)
    ElMessage.error('导出失败，请重试')
  } finally {
    loading.close()
  }
}

function handleShare() {
  const url = window.location.href
  const title = '优伴AI - 优势测评报告'

  if (navigator.share) {
    navigator.share({ title, url }).catch(() => {
      copyToClipboard(url)
    })
  } else {
    copyToClipboard(url)
  }
}

function copyToClipboard(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      ElMessage.success('分享链接已复制到剪贴板')
    }).catch(() => {
      ElMessage.info(`分享链接：${text}`)
    })
  } else {
    // 回退方案
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    try {
      document.execCommand('copy')
      ElMessage.success('分享链接已复制到剪贴板')
    } catch {
      ElMessage.info(`分享链接：${text}`)
    }
    document.body.removeChild(textarea)
  }
}
</script>

<style scoped>
.report-page {
  max-width: 900px;
  margin: 0 auto;
}

/* 报告头部 */
.report-header {
  margin-bottom: 36px;
}
.report-header-top {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
}
.back-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid var(--border);
  background: var(--bg-card);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.2s;
  flex-shrink: 0;
}
.back-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
}
.report-title-area {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
}
.report-title {
  font-size: 26px;
  font-weight: 700;
  color: var(--text-primary);
}
.report-type-badge {
  color: white;
  font-size: 12px;
  font-weight: 500;
  padding: 4px 14px;
  border-radius: 20px;
}
.report-actions {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}
.report-meta {
  display: flex;
  gap: 24px;
  font-size: 13px;
  color: var(--text-muted);
  padding-left: 56px;
}

/* 报告区块 */
.report-section {
  margin-bottom: 40px;
}
.section-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 雷达图 */
.radar-chart-container {
  display: flex;
  gap: 32px;
  align-items: center;
  background: var(--bg-card);
  border-radius: var(--radius);
  padding: 24px;
  border: 1px solid var(--border);
}
.radar-chart-wrapper {
  flex: 1;
  max-width: 360px;
}
.radar-svg {
  width: 100%;
  height: auto;
}
.radar-legend {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 10px;
}
.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}
.legend-label {
  font-size: 14px;
  color: var(--text-secondary);
  width: 48px;
}
.legend-score {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
}

/* 分数卡片 */
.score-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
.score-card {
  background: var(--bg-card);
  border-radius: var(--radius);
  padding: 24px;
  border: 1px solid var(--border);
  border-top: 4px solid;
  transition: all 0.3s ease;
}
.score-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}
.score-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}
.score-card-icon {
  font-size: 20px;
}
.score-card-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}
.score-card-value {
  font-size: 36px;
  font-weight: 800;
  margin-bottom: 8px;
}
.score-card-unit {
  font-size: 16px;
  font-weight: 500;
  opacity: 0.7;
}
.score-card-desc {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 12px;
  line-height: 1.5;
}

/* 优势 */
.strengths-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.strength-card {
  display: flex;
  gap: 16px;
  background: var(--bg-card);
  border-radius: var(--radius);
  padding: 20px 24px;
  border: 1px solid var(--border);
  transition: all 0.3s ease;
}
.strength-card:hover {
  transform: translateX(4px);
  box-shadow: var(--shadow-md);
}
.strength-rank {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  font-weight: 700;
  flex-shrink: 0;
}
.strength-content {
  flex: 1;
}
.strength-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}
.strength-icon {
  font-size: 18px;
}
.strength-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}
.strength-desc {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 10px;
}
.strength-traits {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

/* 盲区 */
.blind-spots {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}
.blind-card {
  background: var(--bg-card);
  border-radius: var(--radius);
  padding: 24px;
  border: 1px solid var(--border);
  border-left: 4px solid var(--accent);
}
.blind-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 10px;
}
.blind-header .el-icon {
  color: var(--accent);
}
.blind-suggestion {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.7;
}

/* 职业推荐 */
.career-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.career-item {
  display: flex;
  align-items: center;
  gap: 16px;
  background: var(--bg-card);
  border-radius: var(--radius);
  padding: 20px 24px;
  border: 1px solid var(--border);
  transition: all 0.3s ease;
}
.career-item:hover {
  transform: translateX(4px);
}
.career-rank {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  flex-shrink: 0;
}
.career-info {
  flex: 1;
}
.career-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}
.career-match-bar {
  height: 8px;
  background: var(--border);
  border-radius: 4px;
  overflow: hidden;
}
.career-match-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 1s ease;
}
.career-match-value {
  font-size: 22px;
  font-weight: 700;
  flex-shrink: 0;
}

/* 底部操作 */
.report-footer {
  display: flex;
  gap: 16px;
  justify-content: center;
  padding: 40px 0;
  flex-wrap: wrap;
}
.growth-btn {
  border: 2px solid var(--border);
}
.report-footer a {
  text-decoration: none;
}

/* 加载中 */
.loading-state {
  text-align: center;
  padding: 100px 20px;
  color: var(--text-muted);
}
.loading-icon {
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 768px) {
  .report-header-top {
    flex-wrap: wrap;
  }
  .report-actions {
    width: 100%;
    justify-content: flex-end;
  }
  .report-meta {
    flex-direction: column;
    gap: 4px;
    padding-left: 0;
  }
  .radar-chart-container {
    flex-direction: column;
    align-items: center;
  }
  .radar-legend {
    flex-direction: row;
    gap: 20px;
    flex-wrap: wrap;
    justify-content: center;
  }
  .score-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  .blind-spots {
    grid-template-columns: 1fr;
  }
  .report-title {
    font-size: 22px;
  }
}
@media (max-width: 480px) {
  .score-cards {
    grid-template-columns: 1fr;
  }
  .report-footer {
    flex-direction: column;
    align-items: center;
  }
  .career-match-value {
    font-size: 18px;
  }
}

/* 打印/导出时隐藏交互元素 */
@media print {
  .report-actions,
  .report-footer,
  .back-btn {
    display: none !important;
  }
  .report-page {
    max-width: 100%;
    margin: 0;
    padding: 0;
  }
  .report-header-top {
    gap: 8px;
  }
  .report-header {
    margin-bottom: 20px;
  }
  .report-section {
    margin-bottom: 24px;
    page-break-inside: avoid;
  }
  .strength-card,
  .blind-card,
  .career-item {
    page-break-inside: avoid;
  }
}
</style>