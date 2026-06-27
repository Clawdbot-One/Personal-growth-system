<template>
  <AppLayout>
    <div class="practice-index">
      <!-- 推荐区域 -->
      <section class="recommend-section card">
        <div class="section-header">
          <div class="header-left">
            <el-icon class="section-icon" :size="22"><StarFilled /></el-icon>
            <h2>为你推荐</h2>
            <el-tag type="warning" size="small" effect="plain">基于你的优势匹配</el-tag>
          </div>
        </div>
        <p class="section-desc">根据你的五大优势，AI 为你精选以下实践项目，助力精准成长</p>
        <div class="recommend-grid">
          <div
            v-for="project in recommendedProjects"
            :key="project.id"
            class="recommend-card"
            @click="goDetail(project.id)"
          >
            <div class="rec-card-top">
              <div class="rec-match">
                <el-progress
                  :percentage="project.matchScore"
                  :stroke-width="6"
                  :color="matchColor(project.matchScore)"
                  :show-text="false"
                />
                <span class="match-score" :style="{ color: matchColor(project.matchScore) }">{{ project.matchScore }}%</span>
              </div>
              <h3 class="rec-name">{{ project.name }}</h3>
              <el-tag :type="categoryTagType(project.category)" size="small">{{ project.category }}</el-tag>
            </div>
            <div class="rec-card-bottom">
              <span class="rec-match-text">
                <el-icon><Connection /></el-icon>
                匹配优势：{{ project.matchStrength }}
              </span>
              <span class="rec-duration">
                <el-icon><Timer /></el-icon>
                {{ project.duration }}
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- 筛选栏 -->
      <section class="filter-section">
        <div class="search-bar">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索实践项目..."
            :prefix-icon="Search"
            clearable
            size="large"
            class="search-input"
          />
        </div>
        <div class="filter-bar">
          <div class="filter-tabs">
            <span
              v-for="cat in categories"
              :key="cat"
              class="filter-tab"
              :class="{ active: activeCategory === cat }"
              @click="activeCategory = cat"
            >{{ cat }}</span>
          </div>
          <div class="filter-selects">
            <el-select v-model="difficultyFilter" placeholder="难度" clearable size="default" class="filter-select">
              <el-option label="全部难度" value="" />
              <el-option label="简单" value="简单" />
              <el-option label="中等" value="中等" />
              <el-option label="困难" value="困难" />
            </el-select>
            <el-select v-model="durationFilter" placeholder="周期" clearable size="default" class="filter-select">
              <el-option label="全部周期" value="" />
              <el-option label="21天以内" value="short" />
              <el-option label="30天" value="30天" />
              <el-option label="45天以上" value="long" />
            </el-select>
          </div>
        </div>
      </section>

      <!-- 项目卡片网格 -->
      <section class="projects-grid">
        <div
          v-for="project in filteredProjects"
          :key="project.id"
          class="project-card card"
          @click="goDetail(project.id)"
        >
          <div class="card-header">
            <div class="card-category-row">
              <el-tag :type="categoryTagType(project.category)" size="small" effect="dark">
                {{ project.category }}
              </el-tag>
              <el-tag
                :type="difficultyTagType(project.difficulty)"
                size="small"
                effect="plain"
              >
                {{ project.difficulty }}
              </el-tag>
            </div>
            <div class="card-match">
              <el-progress
                type="dashboard"
                :percentage="project.matchScore"
                :stroke-width="5"
                :width="48"
                :color="matchColor(project.matchScore)"
                :show-text="false"
              />
              <span class="card-match-text" :style="{ color: matchColor(project.matchScore) }">
                {{ project.matchScore }}%
              </span>
            </div>
          </div>
          <h3 class="card-title">{{ project.name }}</h3>
          <p class="card-desc">{{ project.desc }}</p>
          <div class="card-meta">
            <span class="meta-item">
              <el-icon :size="14"><Connection /></el-icon>
              {{ project.matchStrength }}
            </span>
            <span class="meta-item">
              <el-icon :size="14"><Timer /></el-icon>
              {{ project.duration }}
            </span>
          </div>
          <div class="card-action">
            <span class="action-text">查看详情</span>
            <el-icon><ArrowRight /></el-icon>
          </div>
        </div>
      </section>

      <!-- 空状态 -->
      <el-empty v-if="filteredProjects.length === 0" description="没有找到匹配的实践项目" />
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { usePracticeStore } from '@/stores/practice'
import { useUserStore } from '@/stores/user'
import { Search } from '@element-plus/icons-vue'
import AppLayout from '@/components/layout/AppLayout.vue'

const router = useRouter()
const practiceStore = usePracticeStore()
const userStore = useUserStore()

const searchKeyword = ref('')
const activeCategory = ref('全部')
const difficultyFilter = ref('')
const durationFilter = ref('')

const categories = ['全部', '职场应用', '副业探索', '技能练习', '项目实战', '习惯养成']

const userStrengths = computed(() => userStore.user?.strengths?.top5 || [])

const recommendedProjects = computed(() => {
  return practiceStore.projects
    .filter(p => userStrengths.value.includes(p.matchStrength))
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 3)
})

const filteredProjects = computed(() => {
  let list = practiceStore.projects
  if (activeCategory.value !== '全部') {
    list = list.filter(p => p.category === activeCategory.value)
  }
  if (difficultyFilter.value) {
    list = list.filter(p => p.difficulty === difficultyFilter.value)
  }
  if (durationFilter.value) {
    if (durationFilter.value === 'short') {
      list = list.filter(p => parseInt(p.duration) <= 21)
    } else if (durationFilter.value === 'long') {
      list = list.filter(p => parseInt(p.duration) >= 45)
    } else {
      list = list.filter(p => p.duration === durationFilter.value)
    }
  }
  if (searchKeyword.value) {
    const kw = searchKeyword.value.toLowerCase()
    list = list.filter(p =>
      p.name.toLowerCase().includes(kw) ||
      p.desc.toLowerCase().includes(kw) ||
      p.tags.some(t => t.toLowerCase().includes(kw))
    )
  }
  return list
})

function goDetail(id) {
  router.push(`/practice/${id}`)
}

function matchColor(score) {
  if (score >= 90) return '#10B981'
  if (score >= 80) return '#2563EB'
  if (score >= 70) return '#F97316'
  return '#94A3B8'
}

function categoryTagType(cat) {
  const map = { '职场应用': '', '副业探索': 'success', '技能练习': 'warning', '项目实战': 'danger', '习惯养成': 'info' }
  return map[cat] || ''
}

function difficultyTagType(diff) {
  const map = { '简单': 'success', '中等': 'warning', '困难': 'danger' }
  return map[diff] || 'info'
}
</script>

<style scoped>
.practice-index {
  max-width: 1200px;
  margin: 0 auto;
}

/* 推荐区域 */
.recommend-section {
  padding: 24px;
  margin-bottom: 24px;
  border: 1px solid rgba(37, 99, 235, 0.12);
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.03) 0%, rgba(249, 115, 22, 0.02) 100%);
}
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.header-left h2 {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
}
.section-icon {
  color: var(--accent);
}
.section-desc {
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 20px;
  padding-left: 32px;
}
.recommend-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
.recommend-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 16px;
  cursor: pointer;
  transition: var(--transition);
}
.recommend-card:hover {
  border-color: var(--primary);
  box-shadow: 0 4px 16px rgba(37, 99, 235, 0.1);
  transform: translateY(-2px);
}
.rec-card-top {
  margin-bottom: 12px;
}
.rec-match {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}
.rec-match :deep(.el-progress) {
  flex: 1;
}
.match-score {
  font-size: 16px;
  font-weight: 700;
  min-width: 42px;
  text-align: right;
}
.rec-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
  line-height: 1.4;
}
.rec-card-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: var(--text-muted);
  padding-top: 10px;
  border-top: 1px solid var(--border);
}
.rec-match-text,
.rec-duration {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 筛选栏 */
.filter-section {
  margin-bottom: 24px;
}
.search-bar {
  margin-bottom: 16px;
}
.search-input {
  max-width: 480px;
}
.filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}
.filter-tabs {
  display: flex;
  gap: 4px;
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
  white-space: nowrap;
}
.filter-tab:hover {
  color: var(--primary);
  border-color: rgba(37, 99, 235, 0.3);
}
.filter-tab.active {
  background: var(--primary);
  color: #fff;
  border-color: var(--primary);
  font-weight: 500;
}
.filter-selects {
  display: flex;
  gap: 8px;
}
.filter-select {
  width: 130px;
}

/* 项目网格 */
.projects-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}
.project-card {
  padding: 20px;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  flex-direction: column;
}
.project-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
  border-color: var(--primary);
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 14px;
}
.card-category-row {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.card-match {
  display: flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
}
.card-match-text {
  font-size: 13px;
  font-weight: 700;
  min-width: 36px;
  text-align: center;
}
.card-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
  line-height: 1.4;
}
.card-desc {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.6;
  flex: 1;
  margin-bottom: 14px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.card-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 14px;
  padding-top: 12px;
  border-top: 1px solid var(--border);
}
.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-muted);
}
.card-action {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px;
  border-radius: var(--radius-sm);
  background: rgba(37, 99, 235, 0.05);
  color: var(--primary);
  font-size: 13px;
  font-weight: 500;
  transition: var(--transition);
}
.project-card:hover .card-action {
  background: var(--primary);
  color: #fff;
}

/* 响应式 */
@media (max-width: 1024px) {
  .recommend-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .projects-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 768px) {
  .recommend-section {
    padding: 16px;
  }
  .recommend-grid {
    grid-template-columns: 1fr;
  }
  .projects-grid {
    grid-template-columns: 1fr;
  }
  .filter-bar {
    flex-direction: column;
    align-items: flex-start;
  }
  .filter-selects {
    width: 100%;
  }
  .filter-select {
    flex: 1;
  }
  .search-input {
    max-width: 100%;
  }
  .filter-tabs {
    overflow-x: auto;
    width: 100%;
    padding-bottom: 4px;
  }
}
</style>