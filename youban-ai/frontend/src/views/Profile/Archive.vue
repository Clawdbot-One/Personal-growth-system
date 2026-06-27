<template>
  <AppLayout>
    <div class="archive-page">
      <!-- 页面标题 -->
      <div class="page-header">
        <h2>成长档案</h2>
        <el-button type="primary" plain size="default">
          <el-icon><Download /></el-icon>
          导出数据
        </el-button>
      </div>

      <!-- 数据概览卡片 -->
      <div class="overview-cards">
        <div class="overview-card card">
          <span class="overview-value">{{ userStore.user?.stats?.consecutiveDays || 0 }}</span>
          <span class="overview-label">连续成长天数</span>
          <div class="overview-trend up">
            <el-icon><Top /></el-icon>
            <span>较上月 +5天</span>
          </div>
        </div>
        <div class="overview-card card">
          <span class="overview-value">{{ userStore.user?.stats?.totalHours || 0 }}h</span>
          <span class="overview-label">累计学习时长</span>
          <div class="overview-trend up">
            <el-icon><Top /></el-icon>
            <span>较上月 +12h</span>
          </div>
        </div>
        <div class="overview-card card">
          <span class="overview-value">{{ userStore.user?.stats?.completedTasks || 0 }}</span>
          <span class="overview-label">完成实践任务</span>
          <div class="overview-trend up">
            <el-icon><Top /></el-icon>
            <span>较上月 +8个</span>
          </div>
        </div>
        <div class="overview-card card">
          <span class="overview-value">{{ userStore.user?.stats?.achievements || 0 }}</span>
          <span class="overview-label">获得成就徽章</span>
          <div class="overview-trend up">
            <el-icon><Top /></el-icon>
            <span>较上月 +3个</span>
          </div>
        </div>
      </div>

      <!-- 成长数据可视化 -->
      <section class="chart-section card">
        <h3 class="section-title">
          <el-icon><TrendCharts /></el-icon>
          成长数据可视化
        </h3>
        <div class="charts-row">
          <!-- 优势维度雷达图（简化SVG） -->
          <div class="chart-box">
            <h4>优势维度分布</h4>
            <div class="radar-chart">
              <svg viewBox="0 0 200 200" class="radar-svg">
                <polygon
                  :points="radarPoints"
                  fill="rgba(37, 99, 235, 0.15)"
                  stroke="#2563EB"
                  stroke-width="2"
                />
                <text x="100" y="12" text-anchor="middle" font-size="9" fill="var(--text-muted)">天赋</text>
                <text x="180" y="65" text-anchor="start" font-size="9" fill="var(--text-muted)">技能</text>
                <text x="180" y="135" text-anchor="start" font-size="9" fill="var(--text-muted)">品格</text>
                <text x="100" y="195" text-anchor="middle" font-size="9" fill="var(--text-muted)">价值观</text>
                <text x="15" y="135" text-anchor="end" font-size="9" fill="var(--text-muted)">学习力</text>
                <text x="15" y="65" text-anchor="end" font-size="9" fill="var(--text-muted)">领导力</text>
              </svg>
            </div>
          </div>
          <!-- 月度成长柱状图 -->
          <div class="chart-box">
            <h4>月度成长趋势</h4>
            <div class="bar-chart">
              <div
                v-for="bar in monthlyBars"
                :key="bar.month"
                class="bar-item"
              >
                <div class="bar-wrapper">
                  <div
                    class="bar-fill"
                    :style="{ height: bar.value + '%' }"
                  ></div>
                </div>
                <span class="bar-label">{{ bar.month }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 筛选标签 -->
      <div class="filter-tabs">
        <span
          v-for="tab in filterTabs"
          :key="tab.value"
          class="filter-tab"
          :class="{ active: activeFilter === tab.value }"
          @click="activeFilter = tab.value"
        >{{ tab.label }}</span>
      </div>

      <!-- 时间线 -->
      <section class="timeline-section">
        <div
          v-for="(item, idx) in filteredTimeline"
          :key="idx"
          class="timeline-item card"
        >
          <div class="timeline-dot" :style="{ background: item.color }"></div>
          <div class="timeline-line" v-if="idx < filteredTimeline.length - 1"></div>
          <div class="timeline-content">
            <div class="timeline-header">
              <div class="timeline-type">
                <el-icon :size="16" :color="item.color">
                  <component :is="item.icon" />
                </el-icon>
                <el-tag :type="item.tagType" size="small" effect="plain">{{ item.type }}</el-tag>
              </div>
              <span class="timeline-date">{{ item.date }}</span>
            </div>
            <h4 class="timeline-title">{{ item.title }}</h4>
            <p class="timeline-desc">{{ item.desc }}</p>
          </div>
        </div>
      </section>

      <el-empty v-if="filteredTimeline.length === 0" description="暂无记录" />
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import AppLayout from '@/components/layout/AppLayout.vue'

const userStore = useUserStore()
const activeFilter = ref('all')

const filterTabs = [
  { label: '全部', value: 'all' },
  { label: '测评记录', value: 'assessment' },
  { label: '目标任务', value: 'goal' },
  { label: '对话历史', value: 'chat' },
  { label: '实践成果', value: 'practice' },
]

const timelineData = [
  {
    date: '2026-06-27',
    type: '实践成果',
    icon: 'Collection',
    color: '#F59E0B',
    tagType: 'warning',
    title: '完成「30天写作挑战」第15天打卡',
    desc: '输出一篇800字文章，主题为个人成长方法论',
    category: 'practice',
  },
  {
    date: '2026-06-26',
    type: '对话历史',
    icon: 'ChatDotRound',
    color: '#8B5CF6',
    tagType: '',
    title: '与AI成长助手进行职业规划咨询',
    desc: '探讨了当前职业发展方向，获得了定制化建议',
    category: 'chat',
  },
  {
    date: '2026-06-25',
    type: '目标任务',
    icon: 'Flag',
    color: '#F97316',
    tagType: 'danger',
    title: '完成「提升沟通能力」周目标',
    desc: '本周完成3次有效沟通练习，获得导师反馈',
    category: 'goal',
  },
  {
    date: '2026-06-24',
    type: '测评记录',
    icon: 'EditPen',
    color: '#10B981',
    tagType: 'success',
    title: '完成专业完整版优势测评',
    desc: '五大优势：战略思维、学习能力、责任担当、沟通表达、适应力',
    category: 'assessment',
  },
  {
    date: '2026-06-22',
    type: '实践成果',
    icon: 'Collection',
    color: '#F59E0B',
    tagType: 'warning',
    title: '开启「项目管理实战」实践项目',
    desc: '项目启动阶段完成，明确目标、范围与干系人',
    category: 'practice',
  },
  {
    date: '2026-06-20',
    type: '目标任务',
    icon: 'Flag',
    color: '#F97316',
    tagType: 'danger',
    title: '设定「提升领导力」月度目标',
    desc: '目标包含阅读2本领导力书籍、带领1个小项目',
    category: 'goal',
  },
  {
    date: '2026-06-18',
    type: '对话历史',
    icon: 'ChatDotRound',
    color: '#8B5CF6',
    tagType: '',
    title: '与AI助手探讨学习效率提升方法',
    desc: '获得费曼学习法、间隔重复等高效学习方法指导',
    category: 'chat',
  },
  {
    date: '2026-06-15',
    type: '测评记录',
    icon: 'EditPen',
    color: '#10B981',
    tagType: 'success',
    title: '完成快速精简版测评',
    desc: '初步了解个人优势方向，获得基础成长建议',
    category: 'assessment',
  },
]

const filteredTimeline = computed(() => {
  if (activeFilter.value === 'all') return timelineData
  return timelineData.filter(item => item.category === activeFilter.value)
})

const scores = computed(() => userStore.user?.strengths?.scores || { talent: 85, skill: 72, character: 88, value: 79 })
const radarPoints = computed(() => {
  const cx = 100, cy = 100, r = 70
  const s = scores.value
  const angles = [-90, -18, 54, 126, 198, 270]
  const values = [
    s.talent, s.leadership || 60, s.skill,
    s.character, s.learning || 65, s.value,
  ]
  return values.map((v, i) => {
    const rad = (angles[i] * Math.PI) / 180
    const dist = (v / 100) * r
    return `${cx + dist * Math.cos(rad)},${cy + dist * Math.sin(rad)}`
  }).join(' ')
})

const monthlyBars = [
  { month: '1月', value: 45 },
  { month: '2月', value: 52 },
  { month: '3月', value: 48 },
  { month: '4月', value: 65 },
  { month: '5月', value: 72 },
  { month: '6月', value: 85 },
]
</script>

<style scoped>
.archive-page {
  max-width: 900px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}
.page-header h2 {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
}

/* 概览卡片 */
.overview-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}
.overview-card {
  padding: 18px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}
.overview-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--primary);
  margin-bottom: 4px;
}
.overview-label {
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 8px;
}
.overview-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
}
.overview-trend.up {
  color: #10B981;
}

/* 图表区域 */
.chart-section {
  padding: 24px;
  margin-bottom: 20px;
}
.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 17px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 20px;
}
.charts-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
}
.chart-box h4 {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 16px;
  text-align: center;
}
.radar-chart {
  display: flex;
  justify-content: center;
}
.radar-svg {
  width: 200px;
  height: 200px;
}

/* 柱状图 */
.bar-chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  height: 160px;
  padding: 0 8px;
}
.bar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex: 1;
}
.bar-wrapper {
  width: 28px;
  height: 120px;
  background: rgba(37, 99, 235, 0.06);
  border-radius: 6px 6px 0 0;
  display: flex;
  flex-direction: column-reverse;
  overflow: hidden;
}
.bar-fill {
  width: 100%;
  background: linear-gradient(180deg, #2563EB 0%, #3B82F6 100%);
  border-radius: 6px 6px 0 0;
  transition: height 0.6s ease;
}
.bar-label {
  font-size: 11px;
  color: var(--text-muted);
}

/* 筛选标签 */
.filter-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}
.filter-tab {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 13px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: var(--transition);
  background: var(--bg-card);
  border: 1px solid var(--border);
}
.filter-tab:hover {
  color: var(--primary);
  border-color: rgba(37, 99, 235, 0.3);
}
.filter-tab.active {
  background: var(--primary);
  color: #fff;
  border-color: var(--primary);
}

/* 时间线 */
.timeline-section {
  position: relative;
  padding-left: 32px;
}
.timeline-item {
  position: relative;
  padding: 18px 20px;
  margin-bottom: 12px;
  border: 1px solid var(--border);
}
.timeline-dot {
  position: absolute;
  left: -28px;
  top: 24px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid var(--bg-card);
  box-shadow: 0 0 0 2px currentColor;
  z-index: 2;
}
.timeline-line {
  position: absolute;
  left: -23px;
  top: 40px;
  bottom: -12px;
  width: 2px;
  background: var(--border);
  z-index: 1;
}
.timeline-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.timeline-type {
  display: flex;
  align-items: center;
  gap: 8px;
}
.timeline-date {
  font-size: 12px;
  color: var(--text-muted);
}
.timeline-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 6px;
}
.timeline-desc {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.6;
}

/* 响应式 */
@media (max-width: 768px) {
  .overview-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  .charts-row {
    grid-template-columns: 1fr;
  }
  .timeline-section {
    padding-left: 24px;
  }
  .timeline-dot {
    left: -20px;
  }
  .timeline-line {
    left: -15px;
  }
}
</style>