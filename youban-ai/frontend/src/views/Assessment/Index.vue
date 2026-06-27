<template>
  <AppLayout>
    <div class="assessment-index">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1 class="page-title">优势测评</h1>
        <p class="page-desc">选择适合你的测评方式，发现你的天赋优势与成长方向</p>
      </div>

      <!-- 测评类型卡片 -->
      <div class="assessment-types">
        <div
          class="type-card"
          v-for="item in assessmentTypes"
          :key="item.type"
          :style="{ borderTopColor: item.color }"
          @click="goToTest(item.route)"
        >
          <div class="type-card-header">
            <div class="type-icon" :style="{ background: item.color }">
              <el-icon :size="28">
                <component :is="item.icon" />
              </el-icon>
            </div>
            <div class="type-badges">
              <el-tag :color="item.color" effect="light" size="small" round>
                {{ item.time }}
              </el-tag>
              <el-tag type="info" effect="light" size="small" round>
                {{ item.questions }}
              </el-tag>
            </div>
          </div>
          <h3 class="type-title">{{ item.title }}</h3>
          <p class="type-desc">{{ item.desc }}</p>
          <div class="type-features">
            <span class="type-feature" v-for="f in item.features" :key="f">
              <el-icon><Check /></el-icon> {{ f }}
            </span>
          </div>
          <el-button
            type="primary"
            size="large"
            class="start-btn"
            :style="{
              background: item.color,
              borderColor: item.color,
              boxShadow: `0 4px 16px ${item.color}40`
            }"
            round
            @click.stop="goToTest(item.route)"
          >
            开始测评
            <el-icon><ArrowRight /></el-icon>
          </el-button>
        </div>
      </div>

      <!-- 测评对比表 -->
      <div class="compare-section">
        <h3 class="compare-title">测评方式对比</h3>
        <div class="compare-table">
          <div class="compare-row compare-header-row">
            <div class="compare-cell compare-label"></div>
            <div class="compare-cell" v-for="item in assessmentTypes" :key="item.type">
              {{ item.title }}
            </div>
          </div>
          <div class="compare-row">
            <div class="compare-cell compare-label">题目数量</div>
            <div class="compare-cell" v-for="item in assessmentTypes" :key="item.type">
              {{ item.questions }}
            </div>
          </div>
          <div class="compare-row">
            <div class="compare-cell compare-label">预计时长</div>
            <div class="compare-cell" v-for="item in assessmentTypes" :key="item.type">
              {{ item.time }}
            </div>
          </div>
          <div class="compare-row">
            <div class="compare-cell compare-label">测评维度</div>
            <div class="compare-cell" v-for="item in assessmentTypes" :key="item.type">
              {{ item.dimensions }}
            </div>
          </div>
          <div class="compare-row">
            <div class="compare-cell compare-label">适合人群</div>
            <div class="compare-cell" v-for="item in assessmentTypes" :key="item.type">
              {{ item.audience }}
            </div>
          </div>
        </div>
      </div>

      <!-- 历史报告 -->
      <div class="reports-section" v-if="assessmentStore.reports.length > 0">
        <div class="reports-header">
          <h3 class="reports-title">历史测评报告</h3>
          <span class="reports-count">共 {{ assessmentStore.reports.length }} 份</span>
        </div>
        <div class="reports-grid">
          <div
            class="report-card card"
            v-for="report in assessmentStore.reports"
            :key="report.id"
            @click="$router.push(`/assessment/report/${report.id}`)"
          >
            <div class="report-card-top">
              <div class="report-type-badge" :style="{ background: getTypeColor(report.type) }">
                {{ getTypeLabel(report.type) }}
              </div>
              <span class="report-date">{{ formatDate(report.createdAt) }}</span>
            </div>
            <div class="report-scores">
              <div class="report-score-item">
                <span class="score-label">天赋</span>
                <el-progress :percentage="report.scores.talent" :stroke-width="6" :color="'#2563EB'" />
              </div>
              <div class="report-score-item">
                <span class="score-label">技能</span>
                <el-progress :percentage="report.scores.skill" :stroke-width="6" :color="'#7C3AED'" />
              </div>
              <div class="report-score-item">
                <span class="score-label">性格</span>
                <el-progress :percentage="report.scores.character" :stroke-width="6" :color="'#059669'" />
              </div>
              <div class="report-score-item">
                <span class="score-label">价值观</span>
                <el-progress :percentage="report.scores.value" :stroke-width="6" :color="'#F97316'" />
              </div>
            </div>
            <div class="report-card-footer">
              <span class="view-report">查看完整报告 →</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div class="empty-reports" v-else>
        <div class="empty-icon">
          <el-icon :size="64"><Document /></el-icon>
        </div>
        <h3 class="empty-title">还没有测评报告</h3>
        <p class="empty-desc">完成一次测评后，你的报告将在这里展示</p>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import AppLayout from '@/components/layout/AppLayout.vue'
import { useRouter } from 'vue-router'
import { useAssessmentStore } from '@/stores/assessment'

const router = useRouter()
const assessmentStore = useAssessmentStore()

const assessmentTypes = [
  {
    type: 'quick',
    title: '快速精简版',
    desc: '20 道精选题目，快速了解你的核心优势与特质，适合初次体验或时间有限的用户。',
    icon: 'Lightning',
    color: '#2563EB',
    time: '约 5 分钟',
    questions: '20 题',
    dimensions: '天赋 / 技能 / 性格 / 价值观',
    audience: '初次测评 / 时间有限',
    features: ['20 道精选题目', '四维快速定位', '即时生成报告'],
    route: '/assessment/quick',
  },
  {
    type: 'full',
    title: '专业完整版',
    desc: '60 道全面深度题目，多维度系统分析你的天赋优势，生成专业级成长报告。',
    icon: 'TrophyBase',
    color: '#7C3AED',
    time: '约 15 分钟',
    questions: '60 题',
    dimensions: '天赋 / 技能 / 性格 / 价值观',
    audience: '深度自我认知 / 职业规划',
    features: ['60 道深度题目', '四维精细分析', '专业成长建议'],
    route: '/assessment/full',
  },
  {
    type: 'interview',
    title: '深度访谈版',
    desc: 'AI 对话式测评，通过自然对话深入了解你的内在特质，像朋友聊天一样轻松。',
    icon: 'ChatLineRound',
    color: '#F97316',
    time: '约 10 分钟',
    questions: '10 题',
    dimensions: '天赋 / 技能 / 性格 / 价值观',
    audience: '喜欢深度交流 / 开放探索',
    features: ['AI 智能对话', '开放式问答', '深度洞察分析'],
    route: '/assessment/interview',
  },
]

function goToTest(route) {
  router.push(route)
}

function getTypeLabel(type) {
  const map = { quick: '快速版', full: '完整版', interview: '访谈版' }
  return map[type] || type
}

function getTypeColor(type) {
  const map = { quick: '#2563EB', full: '#7C3AED', interview: '#F97316' }
  return map[type] || '#2563EB'
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
</script>

<style scoped>
.assessment-index {
  max-width: 1000px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 36px;
}
.page-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
}
.page-desc {
  font-size: 15px;
  color: var(--text-secondary);
}

/* 测评类型卡片 */
.assessment-types {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 48px;
}
.type-card {
  background: var(--bg-card);
  border-radius: var(--radius);
  padding: 32px 24px;
  border: 1px solid var(--border);
  border-top: 4px solid;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  cursor: pointer;
}
.type-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.1);
}
.type-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20px;
}
.type-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}
.type-badges {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.type-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 10px;
}
.type-desc {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.7;
  margin-bottom: 20px;
  flex: 1;
}
.type-features {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 24px;
}
.type-feature {
  font-size: 13px;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 6px;
}
.type-feature .el-icon {
  color: var(--success);
  font-size: 14px;
}
.start-btn {
  width: 100%;
  font-weight: 600;
  font-size: 15px;
  padding: 12px 0;
}

/* 对比表 */
.compare-section {
  margin-bottom: 48px;
}
.compare-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 20px;
}
.compare-table {
  background: var(--bg-card);
  border-radius: var(--radius);
  border: 1px solid var(--border);
  overflow: hidden;
}
.compare-row {
  display: grid;
  grid-template-columns: 140px 1fr 1fr 1fr;
}
.compare-row:not(:last-child) {
  border-bottom: 1px solid var(--border);
}
.compare-header-row {
  background: rgba(37, 99, 235, 0.04);
  font-weight: 600;
}
.compare-cell {
  padding: 14px 16px;
  font-size: 14px;
  color: var(--text-primary);
  display: flex;
  align-items: center;
}
.compare-label {
  color: var(--text-secondary);
  font-weight: 500;
  background: rgba(37, 99, 235, 0.02);
}

/* 历史报告 */
.reports-section {
  margin-bottom: 48px;
}
.reports-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}
.reports-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
}
.reports-count {
  font-size: 13px;
  color: var(--text-muted);
}
.reports-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}
.report-card {
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
}
.report-card:hover {
  transform: translateY(-2px);
}
.report-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}
.report-type-badge {
  color: white;
  font-size: 12px;
  font-weight: 500;
  padding: 4px 12px;
  border-radius: 20px;
}
.report-date {
  font-size: 12px;
  color: var(--text-muted);
}
.report-scores {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}
.report-score-item {
  display: flex;
  align-items: center;
  gap: 12px;
}
.score-label {
  font-size: 13px;
  color: var(--text-secondary);
  width: 48px;
  font-weight: 500;
}
.report-score-item .el-progress {
  flex: 1;
}
.report-card-footer {
  padding-top: 12px;
  border-top: 1px solid var(--border);
}
.view-report {
  font-size: 13px;
  color: var(--primary);
  font-weight: 500;
}

/* 空状态 */
.empty-reports {
  text-align: center;
  padding: 80px 20px;
}
.empty-icon {
  color: var(--text-muted);
  opacity: 0.4;
  margin-bottom: 20px;
}
.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 8px;
}
.empty-desc {
  font-size: 14px;
  color: var(--text-muted);
}

/* Responsive */
@media (max-width: 900px) {
  .assessment-types {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  .compare-table {
    overflow-x: auto;
  }
  .compare-row {
    grid-template-columns: 100px repeat(3, 140px);
    min-width: 520px;
  }
  .reports-grid {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 480px) {
  .page-title {
    font-size: 24px;
  }
  .type-card {
    padding: 24px 20px;
  }
}
</style>