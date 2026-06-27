<template>
  <AppLayout>
    <div class="practice-detail" v-if="project">
      <!-- 返回按钮 -->
      <el-button text class="back-btn" @click="router.back()">
        <el-icon><ArrowLeft /></el-icon>
        返回实践库
      </el-button>

      <!-- 项目头部 -->
      <section class="detail-header card">
        <div class="header-main">
          <div class="header-info">
            <div class="header-tags">
              <el-tag :type="categoryTagType(project.category)" size="default" effect="dark">
                {{ project.category }}
              </el-tag>
              <el-tag :type="difficultyTagType(project.difficulty)" size="default" effect="plain">
                {{ project.difficulty }}
              </el-tag>
              <span class="header-duration">
                <el-icon><Timer /></el-icon>
                {{ project.duration }}
              </span>
            </div>
            <h1 class="header-title">{{ project.name }}</h1>
            <p class="header-desc">{{ project.desc }}</p>
          </div>
          <div class="header-match">
            <div class="match-circle">
              <el-progress
                type="dashboard"
                :percentage="project.matchScore"
                :stroke-width="8"
                :width="120"
                :color="matchColor(project.matchScore)"
              >
                <template #default="{ percentage }">
                  <span class="match-value" :style="{ color: matchColor(project.matchScore) }">{{ percentage }}%</span>
                </template>
              </el-progress>
              <span class="match-label">适配度</span>
              <span class="match-strength">
                <el-icon><Connection /></el-icon>
                {{ project.matchStrength }}
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- 内容区域 -->
      <div class="detail-content">
        <!-- 步骤指南 -->
        <section class="content-section card">
          <h3 class="section-title">
            <el-icon><List /></el-icon>
            实践步骤指南
          </h3>
          <div class="steps-list">
            <div
              v-for="(step, idx) in project.steps"
              :key="idx"
              class="step-item"
            >
              <div class="step-number">{{ idx + 1 }}</div>
              <div class="step-content">
                <p>{{ step }}</p>
              </div>
            </div>
          </div>
        </section>

        <!-- 能力提升点 -->
        <section class="content-section card">
          <h3 class="section-title">
            <el-icon><TrendCharts /></el-icon>
            能力提升点
          </h3>
          <div class="benefit-content">
            <p>{{ project.benefit }}</p>
          </div>
          <div class="benefit-tags">
            <el-tag
              v-for="tag in project.tags"
              :key="tag"
              type="info"
              size="default"
              effect="plain"
            >{{ tag }}</el-tag>
          </div>
        </section>

        <!-- 成果输出标准 -->
        <section class="content-section card">
          <h3 class="section-title">
            <el-icon><TrophyBase /></el-icon>
            成果输出标准
          </h3>
          <div class="output-standards">
            <div class="standard-item">
              <el-icon class="standard-icon" color="#10B981"><CircleCheckFilled /></el-icon>
              <span>完成所有实践步骤</span>
            </div>
            <div class="standard-item">
              <el-icon class="standard-icon" color="#10B981"><CircleCheckFilled /></el-icon>
              <span>输出一份实践总结报告</span>
            </div>
            <div class="standard-item">
              <el-icon class="standard-icon" color="#10B981"><CircleCheckFilled /></el-icon>
              <span>获得至少 3 次打卡记录</span>
            </div>
            <div class="standard-item">
              <el-icon class="standard-icon" color="#10B981"><CircleCheckFilled /></el-icon>
              <span>完成自我评估与复盘</span>
            </div>
          </div>
        </section>
      </div>

      <!-- 底部操作栏 -->
      <div class="detail-footer">
        <el-button size="large" class="start-btn" @click="showCheckInDialog = true">
          <el-icon><EditPen /></el-icon>
          打卡记录
        </el-button>
        <el-button size="large" type="primary" class="start-btn" @click="startPractice">
          <el-icon><VideoPlay /></el-icon>
          开始实践
        </el-button>
      </div>

      <!-- 打卡弹窗 -->
      <el-dialog
        v-model="showCheckInDialog"
        title="实践打卡"
        width="520px"
        :close-on-click-modal="false"
        class="checkin-dialog"
      >
        <div class="checkin-form">
          <div class="checkin-project-info">
            <span class="checkin-project-name">{{ project.name }}</span>
            <el-tag size="small" effect="plain">{{ project.difficulty }}</el-tag>
          </div>
          <el-form :model="checkinForm" label-position="top">
            <el-form-item label="打卡内容">
              <el-input
                v-model="checkinForm.content"
                type="textarea"
                :rows="4"
                placeholder="记录今天的实践心得、收获或遇到的问题..."
              />
            </el-form-item>
            <el-form-item label="上传图片（可选）">
              <el-upload
                v-model:file-list="checkinForm.images"
                list-type="picture-card"
                :auto-upload="false"
                :limit="3"
              >
                <el-icon><Plus /></el-icon>
              </el-upload>
            </el-form-item>
            <el-form-item label="实践进度">
              <el-progress
                :percentage="checkinProgress"
                :stroke-width="6"
                :color="matchColor(project.matchScore)"
              />
              <span class="progress-text">已完成 {{ checkinProgress }}%</span>
            </el-form-item>
          </el-form>
        </div>
        <template #footer>
          <el-button @click="showCheckInDialog = false">取消</el-button>
          <el-button type="primary" @click="submitCheckIn">提交打卡</el-button>
        </template>
      </el-dialog>
    </div>

    <!-- 项目不存在 -->
    <div class="not-found" v-else>
      <el-empty description="项目不存在">
        <el-button type="primary" @click="router.push('/practice')">返回实践库</el-button>
      </el-empty>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { usePracticeStore } from '@/stores/practice'
import { ElMessage } from 'element-plus'
import AppLayout from '@/components/layout/AppLayout.vue'

const router = useRouter()
const route = useRoute()
const practiceStore = usePracticeStore()

const project = computed(() => {
  return practiceStore.getProject(route.params.id)
})

const showCheckInDialog = ref(false)
const checkinForm = ref({
  content: '',
  images: [],
})
const checkinProgress = ref(35)

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

function startPractice() {
  ElMessage.success('已开启实践项目！加油！')
  checkinProgress.value = 0
}

function submitCheckIn() {
  if (!checkinForm.value.content.trim()) {
    ElMessage.warning('请输入打卡内容')
    return
  }
  practiceStore.addPractice(project.value.id, checkinForm.value.content)
  ElMessage.success('打卡成功！继续加油！')
  checkinProgress.value = Math.min(checkinProgress.value + 15, 100)
  showCheckInDialog.value = false
  checkinForm.value = { content: '', images: [] }
}
</script>

<style scoped>
.practice-detail {
  max-width: 900px;
  margin: 0 auto;
}

.back-btn {
  margin-bottom: 20px;
  font-size: 14px;
  color: var(--text-secondary);
}

/* 头部 */
.detail-header {
  padding: 32px;
  margin-bottom: 24px;
}
.header-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 32px;
}
.header-info {
  flex: 1;
}
.header-tags {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.header-duration {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--text-muted);
}
.header-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 12px;
  line-height: 1.3;
}
.header-desc {
  font-size: 15px;
  color: var(--text-secondary);
  line-height: 1.7;
}
.header-match {
  flex-shrink: 0;
  text-align: center;
}
.match-circle {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.match-value {
  font-size: 28px;
  font-weight: 700;
}
.match-label {
  font-size: 13px;
  color: var(--text-muted);
  margin-top: -8px;
}
.match-strength {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--text-secondary);
  margin-top: 8px;
  padding: 4px 12px;
  background: rgba(37, 99, 235, 0.06);
  border-radius: 20px;
}

/* 内容区 */
.detail-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 100px;
}
.content-section {
  padding: 24px;
}
.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 17px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 20px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--border);
}

/* 步骤 */
.steps-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}
.step-item {
  display: flex;
  gap: 16px;
  padding: 14px 0;
  border-bottom: 1px dashed var(--border);
  transition: var(--transition);
}
.step-item:last-child {
  border-bottom: none;
}
.step-item:hover {
  background: rgba(37, 99, 235, 0.02);
  margin: 0 -12px;
  padding: 14px 12px;
  border-radius: var(--radius-sm);
}
.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 0;
}
.step-content p {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.7;
  padding-top: 4px;
}

/* 能力提升 */
.benefit-content p {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.8;
  margin-bottom: 16px;
}
.benefit-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* 成果标准 */
.output-standards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.standard-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: var(--text-secondary);
}

/* 底部操作栏 */
.detail-footer {
  position: fixed;
  bottom: 0;
  left: 240px;
  right: 0;
  background: var(--bg-card);
  border-top: 1px solid var(--border);
  padding: 16px 32px;
  display: flex;
  justify-content: center;
  gap: 16px;
  z-index: 50;
}
.start-btn {
  min-width: 160px;
  font-size: 15px;
}

/* 打卡弹窗 */
.checkin-form {
  padding: 4px 0;
}
.checkin-project-info {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  padding: 12px;
  background: rgba(37, 99, 235, 0.04);
  border-radius: var(--radius-sm);
}
.checkin-project-name {
  font-weight: 600;
  color: var(--text-primary);
}
.progress-text {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 6px;
  display: block;
}

.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

/* 响应式 */
@media (max-width: 768px) {
  .detail-header {
    padding: 20px;
  }
  .header-main {
    flex-direction: column-reverse;
    align-items: center;
    text-align: center;
  }
  .header-tags {
    justify-content: center;
  }
  .header-title {
    font-size: 22px;
  }
  .detail-footer {
    left: 0;
    padding: 12px 16px;
    padding-bottom: max(12px, env(safe-area-inset-bottom));
  }
  .start-btn {
    min-width: 120px;
  }
  .content-section {
    padding: 16px;
  }
}
</style>