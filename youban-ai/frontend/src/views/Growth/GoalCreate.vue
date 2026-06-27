<template>
  <AppLayout>
    <div class="goal-create">
      <div class="page-header">
        <el-button :icon="ArrowLeft" text @click="goBack">返回</el-button>
        <div>
          <h2>创建成长目标</h2>
          <p class="subtitle">设定清晰的目标，让成长有迹可循</p>
        </div>
      </div>

      <div class="create-layout">
        <!-- 表单区域 -->
        <div class="form-section">
          <el-card class="form-card" shadow="never">
            <template #header>
              <div class="card-title">
                <el-icon :size="18" color="#2563EB"><Edit /></el-icon>
                <span>目标信息</span>
              </div>
            </template>
            <el-form
              ref="formRef"
              :model="form"
              :rules="rules"
              label-position="top"
              size="large"
            >
              <el-form-item label="目标名称" prop="name">
                <el-input
                  v-model="form.name"
                  placeholder="例如：提升公众演讲能力"
                  maxlength="30"
                  show-word-limit
                />
              </el-form-item>

              <el-form-item label="目标描述" prop="desc">
                <el-input
                  v-model="form.desc"
                  type="textarea"
                  :rows="3"
                  placeholder="详细描述你的目标，包括期望达到的具体状态..."
                  maxlength="200"
                  show-word-limit
                />
              </el-form-item>

              <el-row :gutter="16">
                <el-col :span="12">
                  <el-form-item label="目标分类" prop="category">
                    <el-select v-model="form.category" placeholder="选择分类" class="w-full">
                      <el-option label="职业发展" value="职业发展" />
                      <el-option label="技能提升" value="技能提升" />
                      <el-option label="副业探索" value="副业探索" />
                      <el-option label="自我认知" value="自我认知" />
                      <el-option label="习惯养成" value="习惯养成" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="优先级" prop="priority">
                    <el-select v-model="form.priority" placeholder="选择优先级" class="w-full">
                      <el-option label="高优先级" value="high" />
                      <el-option label="中优先级" value="medium" />
                      <el-option label="低优先级" value="low" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="16">
                <el-col :span="12">
                  <el-form-item label="预期周期" prop="cycle">
                    <el-select v-model="form.cycle" placeholder="选择周期" class="w-full">
                      <el-option label="1个月" value="1个月" />
                      <el-option label="3个月" value="3个月" />
                      <el-option label="6个月" value="6个月" />
                      <el-option label="1年" value="1年" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="期望成果" prop="outcome">
                    <el-input
                      v-model="form.outcome"
                      placeholder="例如：能独立完成10分钟的公开演讲"
                      maxlength="50"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-form-item label="当前基础" prop="baseline">
                <el-input
                  v-model="form.baseline"
                  type="textarea"
                  :rows="2"
                  placeholder="描述你目前在这个领域的基础水平..."
                  maxlength="150"
                  show-word-limit
                />
              </el-form-item>

              <el-form-item v-if="form.milestones.length > 0" label="里程碑">
                <div class="milestones-preview">
                  <el-tag
                    v-for="(m, i) in form.milestones"
                    :key="i"
                    closable
                    @close="removeMilestone(i)"
                    class="milestone-tag"
                  >
                    阶段{{ i + 1 }}: {{ m.name }}
                  </el-tag>
                </div>
              </el-form-item>

              <!-- 快速添加里程碑 -->
              <div class="milestone-quick">
                <el-input
                  v-model="milestoneInput"
                  placeholder="快速添加一个里程碑，如：完成基础学习"
                  size="default"
                  @keyup.enter="addMilestone"
                >
                  <template #append>
                    <el-button :icon="Plus" @click="addMilestone">添加</el-button>
                  </template>
                </el-input>
              </div>

              <div class="form-actions">
                <el-button size="large" @click="goBack">取消</el-button>
                <el-button type="primary" size="large" :icon="Check" @click="submitForm" :loading="submitting">
                  创建目标
                </el-button>
              </div>
            </el-form>
          </el-card>
        </div>

        <!-- AI 辅助区 -->
        <div class="ai-section">
          <el-card class="ai-card" shadow="never">
            <template #header>
              <div class="card-title">
                <el-icon :size="18" color="#F97316"><MagicStick /></el-icon>
                <span>AI 智能分析</span>
              </div>
            </template>
            <div class="ai-body">
              <div class="ai-icon-wrap">
                <div class="ai-icon-bg">
                  <el-icon :size="32" color="#2563EB"><Cpu /></el-icon>
                </div>
              </div>
              <p class="ai-desc">
                让 AI 帮你分析目标的可行性，给出阶段拆解建议和资源推荐，让目标更清晰、更易执行。
              </p>
              <el-button
                type="primary"
                :icon="MagicStick"
                size="large"
                class="ai-analyze-btn"
                @click="aiAnalyze"
                :loading="aiLoading"
              >
                AI 帮你分析
              </el-button>

              <!-- AI 建议结果 -->
              <transition name="slide-up">
                <div v-if="aiSuggestions.length" class="ai-suggestions">
                  <div class="ai-suggestions-title">
                    <el-icon :size="16" color="#10B981"><CircleCheck /></el-icon>
                    <span>AI 分析建议</span>
                  </div>
                  <div
                    v-for="(suggestion, i) in aiSuggestions"
                    :key="i"
                    class="suggestion-item"
                  >
                    <el-icon :size="16" color="#2563EB"><Star /></el-icon>
                    <span>{{ suggestion }}</span>
                  </div>
                  <el-button
                    type="primary"
                    size="small"
                    text
                    :icon="DocumentAdd"
                    @click="applySuggestions"
                    class="apply-btn"
                  >
                    采纳建议并填充里程碑
                  </el-button>
                </div>
              </transition>
            </div>
          </el-card>

          <!-- 优势匹配提示 -->
          <el-card class="match-card" shadow="never">
            <template #header>
              <div class="card-title">
                <el-icon :size="18" color="#8B5CF6"><Connection /></el-icon>
                <span>优势匹配</span>
              </div>
            </template>
            <div class="match-body">
              <p class="match-desc">你的核心优势可助力此目标：</p>
              <div class="strength-tags">
                <el-tag
                  v-for="s in userStore.user?.strengths?.top5?.slice(0, 3) || []"
                  :key="s"
                  effect="plain"
                  type="primary"
                  round
                  class="strength-tag"
                >
                  {{ s }}
                </el-tag>
              </div>
            </div>
          </el-card>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useGrowthStore } from '@/stores/growth'
import AppLayout from '@/components/layout/AppLayout.vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const growthStore = useGrowthStore()

const formRef = ref(null)
const submitting = ref(false)
const aiLoading = ref(false)
const aiSuggestions = ref([])
const milestoneInput = ref('')

const form = reactive({
  name: '',
  desc: '',
  category: '',
  priority: 'medium',
  cycle: '3个月',
  outcome: '',
  baseline: '',
  milestones: [],
})

const rules = {
  name: [
    { required: true, message: '请输入目标名称', trigger: 'blur' },
    { min: 2, max: 30, message: '目标名称长度为2-30个字符', trigger: 'blur' },
  ],
  desc: [
    { required: true, message: '请输入目标描述', trigger: 'blur' },
    { min: 5, max: 200, message: '目标描述长度为5-200个字符', trigger: 'blur' },
  ],
  category: [
    { required: true, message: '请选择目标分类', trigger: 'change' },
  ],
  priority: [
    { required: true, message: '请选择优先级', trigger: 'change' },
  ],
  cycle: [
    { required: true, message: '请选择预期周期', trigger: 'change' },
  ],
  outcome: [
    { required: true, message: '请输入期望成果', trigger: 'blur' },
  ],
  baseline: [
    { required: true, message: '请描述当前基础', trigger: 'blur' },
  ],
}

function addMilestone() {
  const val = milestoneInput.value.trim()
  if (!val) return
  form.milestones.push({ name: val, desc: '', done: false })
  milestoneInput.value = ''
}

function removeMilestone(index) {
  form.milestones.splice(index, 1)
}

function aiAnalyze() {
  if (!form.name || !form.desc) {
    ElMessage.warning('请先填写目标名称和描述')
    return
  }
  aiLoading.value = true
  setTimeout(() => {
    aiSuggestions.value = [
      `建议将「${form.name}」拆分为 ${form.cycle === '1个月' ? '3' : '4'} 个阶段逐步推进`,
      '第一阶段应聚焦基础知识的系统学习，建立清晰的知识框架',
      '每完成一个阶段设置一次小测验或实践，确保学以致用',
      `根据你的优势（${userStore.user?.strengths?.top5?.[0] || '学习能力'}），建议采用"学习-实践-复盘"循环模式`,
    ]
    aiLoading.value = false
    ElMessage.success('AI 分析完成！')
  }, 1800)
}

function applySuggestions() {
  const phaseNames = ['基础学习', '技能实践', '进阶提升', '成果检验']
  const count = form.cycle === '1个月' ? 3 : 4
  for (let i = 0; i < count; i++) {
    if (!form.milestones.find(m => m.name === phaseNames[i])) {
      form.milestones.push({ name: phaseNames[i], desc: '', done: false })
    }
  }
  ElMessage.success('已采纳 AI 建议并填充里程碑')
}

async function submitForm() {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
  } catch {
    ElMessage.warning('请完善表单信息')
    return
  }
  submitting.value = true
  // 模拟提交延迟
  await new Promise(r => setTimeout(r, 600))
  const milestones = form.milestones.map((m, i) => ({
    id: `m${Date.now()}_${i}`,
    name: m.name,
    desc: m.desc || '',
    done: false,
  }))
  growthStore.addGoal({
    name: form.name,
    desc: form.desc,
    category: form.category,
    priority: form.priority,
    status: 'active',
    cycle: form.cycle,
    outcome: form.outcome,
    baseline: form.baseline,
    milestones,
    tasks: [],
  })
  ElMessage.success('目标创建成功！')
  submitting.value = false
  router.push('/growth')
}

function goBack() {
  router.push('/growth')
}
</script>

<style scoped>
.goal-create {
  max-width: 1100px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 24px;
}
.page-header h2 {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 6px 0 4px;
}
.subtitle {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
}

.create-layout {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 24px;
  align-items: start;
}

/* 卡片 */
.form-card,
.ai-card,
.match-card {
  border-radius: var(--radius);
  border: 1px solid var(--border);
}
.form-card :deep(.el-card__header),
.ai-card :deep(.el-card__header),
.match-card :deep(.el-card__header) {
  padding: 14px 20px;
  border-bottom: 1px solid var(--border);
}
.form-card :deep(.el-card__body) {
  padding: 20px 24px;
}
.ai-card :deep(.el-card__body),
.match-card :deep(.el-card__body) {
  padding: 20px;
}
.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

/* 里程碑预览 */
.milestones-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.milestone-tag {
  margin: 0;
}

/* 快速添加 */
.milestone-quick {
  margin-top: 8px;
  margin-bottom: 8px;
}

/* 表单操作 */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--border);
}

/* AI 区 */
.ai-card {
  border-color: rgba(37, 99, 235, 0.15);
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.02) 0%, rgba(249, 115, 22, 0.02) 100%);
}
.ai-body {
  text-align: center;
}
.ai-icon-wrap {
  display: flex;
  justify-content: center;
  margin-bottom: 14px;
}
.ai-icon-bg {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: rgba(37, 99, 235, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
}
.ai-desc {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.7;
  margin: 0 0 16px;
}
.ai-analyze-btn {
  width: 100%;
}

/* AI 建议 */
.ai-suggestions {
  margin-top: 16px;
  padding: 14px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  text-align: left;
}
.ai-suggestions-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 10px;
}
.suggestion-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 8px;
  line-height: 1.6;
}
.apply-btn {
  margin-top: 8px;
}

/* 优势匹配 */
.match-card {
  margin-top: 20px;
}
.match-body {
  text-align: center;
}
.match-desc {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0 0 10px;
}
.strength-tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
}
.strength-tag {
  cursor: default;
}

/* 过渡动画 */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.35s ease;
}
.slide-up-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* 响应式 */
@media (max-width: 900px) {
  .create-layout {
    grid-template-columns: 1fr;
  }
  .ai-section {
    order: -1;
  }
  .match-card {
    margin-top: 0;
    margin-bottom: 20px;
  }
  .form-card :deep(.el-card__body) {
    padding: 16px;
  }
}
@media (max-width: 640px) {
  .page-header h2 {
    font-size: 18px;
  }
}
</style>