<template>
  <AppLayout>
    <div class="admin-content">
      <div class="page-header">
        <h2>内容管理</h2>
      </div>

      <el-tabs v-model="activeTab" class="content-tabs">
        <!-- 测评题库 -->
        <el-tab-pane label="测评题库" name="assessment">
          <div class="tab-toolbar">
            <el-button type="primary" @click="openDialog('assessment')">
              <el-icon><Plus /></el-icon>
              添加题目
            </el-button>
            <el-input v-model="searchAssessment" placeholder="搜索题目..." :prefix-icon="Search" clearable class="toolbar-search" />
          </div>
          <el-table :data="filteredAssessment" stripe class="content-table">
            <el-table-column prop="id" label="ID" width="60" />
            <el-table-column prop="title" label="题目内容" min-width="240" show-overflow-tooltip />
            <el-table-column prop="category" label="分类" width="100">
              <template #default="{ row }">
                <el-tag size="small" effect="plain">{{ row.category }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="type" label="题型" width="80" />
            <el-table-column label="状态" width="90">
              <template #default="{ row }">
                <el-switch
                  v-model="row.status"
                  :active-value="'published'"
                  :inactive-value="'draft'"
                  active-text="上架"
                  inactive-text="下架"
                  inline-prompt
                  size="small"
                  @change="toggleStatus(row, 'assessment')"
                />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="160" fixed="right">
              <template #default="{ row }">
                <el-button text type="primary" size="small" @click="editItem(row, 'assessment')">编辑</el-button>
                <el-popconfirm title="确定删除？" @confirm="deleteItem(row, 'assessment')">
                  <template #reference>
                    <el-button text type="danger" size="small">删除</el-button>
                  </template>
                </el-popconfirm>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 实践内容 -->
        <el-tab-pane label="实践内容" name="practice">
          <div class="tab-toolbar">
            <el-button type="primary" @click="openDialog('practice')">
              <el-icon><Plus /></el-icon>
              添加实践
            </el-button>
            <el-input v-model="searchPractice" placeholder="搜索实践..." :prefix-icon="Search" clearable class="toolbar-search" />
          </div>
          <el-table :data="filteredPractice" stripe class="content-table">
            <el-table-column prop="id" label="ID" width="60" />
            <el-table-column prop="name" label="名称" min-width="180" />
            <el-table-column prop="category" label="分类" width="100">
              <template #default="{ row }">
                <el-tag size="small" effect="plain">{{ row.category }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="difficulty" label="难度" width="80" />
            <el-table-column label="状态" width="90">
              <template #default="{ row }">
                <el-switch
                  v-model="row.status"
                  :active-value="'published'"
                  :inactive-value="'draft'"
                  active-text="上架"
                  inactive-text="下架"
                  inline-prompt
                  size="small"
                  @change="toggleStatus(row, 'practice')"
                />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="160" fixed="right">
              <template #default="{ row }">
                <el-button text type="primary" size="small" @click="editItem(row, 'practice')">编辑</el-button>
                <el-popconfirm title="确定删除？" @confirm="deleteItem(row, 'practice')">
                  <template #reference>
                    <el-button text type="danger" size="small">删除</el-button>
                  </template>
                </el-popconfirm>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 资源库 -->
        <el-tab-pane label="资源库" name="resource">
          <div class="tab-toolbar">
            <el-button type="primary" @click="openDialog('resource')">
              <el-icon><Plus /></el-icon>
              上传资源
            </el-button>
            <el-input v-model="searchResource" placeholder="搜索资源..." :prefix-icon="Search" clearable class="toolbar-search" />
          </div>
          <el-table :data="filteredResources" stripe class="content-table">
            <el-table-column prop="id" label="ID" width="60" />
            <el-table-column prop="name" label="资源名称" min-width="200" />
            <el-table-column prop="type" label="类型" width="100">
              <template #default="{ row }">
                <el-tag :type="resourceTypeTag(row.type)" size="small" effect="plain">{{ row.type }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="size" label="大小" width="80" />
            <el-table-column label="状态" width="90">
              <template #default="{ row }">
                <el-switch
                  v-model="row.status"
                  :active-value="'published'"
                  :inactive-value="'draft'"
                  active-text="上架"
                  inactive-text="下架"
                  inline-prompt
                  size="small"
                  @change="toggleStatus(row, 'resource')"
                />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="160" fixed="right">
              <template #default="{ row }">
                <el-button text type="primary" size="small" @click="editItem(row, 'resource')">编辑</el-button>
                <el-popconfirm title="确定删除？" @confirm="deleteItem(row, 'resource')">
                  <template #reference>
                    <el-button text type="danger" size="small">删除</el-button>
                  </template>
                </el-popconfirm>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 公告管理 -->
        <el-tab-pane label="公告管理" name="announcement">
          <div class="tab-toolbar">
            <el-button type="primary" @click="openDialog('announcement')">
              <el-icon><Plus /></el-icon>
              发布公告
            </el-button>
            <el-input v-model="searchAnnouncement" placeholder="搜索公告..." :prefix-icon="Search" clearable class="toolbar-search" />
          </div>
          <el-table :data="filteredAnnouncements" stripe class="content-table">
            <el-table-column prop="id" label="ID" width="60" />
            <el-table-column prop="title" label="标题" min-width="200" />
            <el-table-column prop="author" label="发布人" width="100" />
            <el-table-column prop="date" label="发布时间" width="120" />
            <el-table-column label="状态" width="90">
              <template #default="{ row }">
                <el-switch
                  v-model="row.status"
                  :active-value="'published'"
                  :inactive-value="'draft'"
                  active-text="上架"
                  inactive-text="下架"
                  inline-prompt
                  size="small"
                  @change="toggleStatus(row, 'announcement')"
                />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="160" fixed="right">
              <template #default="{ row }">
                <el-button text type="primary" size="small" @click="editItem(row, 'announcement')">编辑</el-button>
                <el-popconfirm title="确定删除？" @confirm="deleteItem(row, 'announcement')">
                  <template #reference>
                    <el-button text type="danger" size="small">删除</el-button>
                  </template>
                </el-popconfirm>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>

      <!-- 编辑/新增弹窗 -->
      <el-dialog
        v-model="dialogVisible"
        :title="dialogTitle"
        width="560px"
        :close-on-click-modal="false"
      >
        <el-form :model="formData" label-position="top">
          <el-form-item v-if="dialogType === 'assessment'" label="题目内容">
            <el-input v-model="formData.title" type="textarea" :rows="3" placeholder="请输入题目内容" />
          </el-form-item>
          <el-form-item v-if="dialogType === 'practice'" label="项目名称">
            <el-input v-model="formData.name" placeholder="请输入项目名称" />
          </el-form-item>
          <el-form-item v-if="dialogType === 'resource'" label="资源名称">
            <el-input v-model="formData.name" placeholder="请输入资源名称" />
          </el-form-item>
          <el-form-item v-if="dialogType === 'announcement'" label="公告标题">
            <el-input v-model="formData.title" placeholder="请输入公告标题" />
          </el-form-item>
          <el-form-item v-if="dialogType === 'assessment'" label="分类">
            <el-select v-model="formData.category" placeholder="选择分类">
              <el-option label="天赋优势" value="天赋优势" />
              <el-option label="性格特质" value="性格特质" />
              <el-option label="职业倾向" value="职业倾向" />
              <el-option label="学习风格" value="学习风格" />
            </el-select>
          </el-form-item>
          <el-form-item v-if="dialogType === 'practice'" label="分类">
            <el-select v-model="formData.category" placeholder="选择分类">
              <el-option label="职场应用" value="职场应用" />
              <el-option label="副业探索" value="副业探索" />
              <el-option label="技能练习" value="技能练习" />
              <el-option label="项目实战" value="项目实战" />
              <el-option label="习惯养成" value="习惯养成" />
            </el-select>
          </el-form-item>
          <el-form-item v-if="dialogType === 'practice'" label="难度">
            <el-select v-model="formData.difficulty" placeholder="选择难度">
              <el-option label="简单" value="简单" />
              <el-option label="中等" value="中等" />
              <el-option label="困难" value="困难" />
            </el-select>
          </el-form-item>
          <el-form-item v-if="dialogType === 'resource'" label="资源类型">
            <el-select v-model="formData.type" placeholder="选择类型">
              <el-option label="文档" value="文档" />
              <el-option label="视频" value="视频" />
              <el-option label="音频" value="音频" />
              <el-option label="图片" value="图片" />
            </el-select>
          </el-form-item>
          <el-form-item v-if="dialogType === 'announcement'" label="公告内容">
            <el-input v-model="formData.content" type="textarea" :rows="4" placeholder="请输入公告内容" />
          </el-form-item>
          <el-form-item v-if="dialogType === 'assessment'" label="题型">
            <el-select v-model="formData.type" placeholder="选择题型">
              <el-option label="单选题" value="单选题" />
              <el-option label="多选题" value="多选题" />
              <el-option label="量表题" value="量表题" />
              <el-option label="开放题" value="开放题" />
            </el-select>
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveDialog">保存</el-button>
        </template>
      </el-dialog>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import AppLayout from '@/components/layout/AppLayout.vue'

const activeTab = ref('assessment')

// 搜索
const searchAssessment = ref('')
const searchPractice = ref('')
const searchResource = ref('')
const searchAnnouncement = ref('')

// 测评题库数据
const assessmentItems = ref([
  { id: 1, title: '在面对新挑战时，你通常如何应对？', category: '天赋优势', type: '单选题', status: 'published' },
  { id: 2, title: '你最享受的工作方式是什么？', category: '职业倾向', type: '单选题', status: 'published' },
  { id: 3, title: '描述你最近一次克服困难的经历', category: '性格特质', type: '开放题', status: 'draft' },
  { id: 4, title: '请评估你在团队协作中的表现', category: '天赋优势', type: '量表题', status: 'published' },
])

// 实践内容数据
const practiceItems = ref([
  { id: 1, name: '30天写作挑战', category: '技能练习', difficulty: '中等', status: 'published' },
  { id: 2, name: '项目管理实战', category: '职场应用', difficulty: '困难', status: 'published' },
  { id: 3, name: '副业探索实验室', category: '副业探索', difficulty: '中等', status: 'published' },
  { id: 4, name: '学习力飞轮', category: '技能练习', difficulty: '简单', status: 'draft' },
])

// 资源库数据
const resourceItems = ref([
  { id: 1, name: '优势识别指南.pdf', type: '文档', size: '2.4MB', status: 'published' },
  { id: 2, name: '成长方法论视频课', type: '视频', size: '156MB', status: 'published' },
  { id: 3, name: '冥想引导音频', type: '音频', size: '28MB', status: 'draft' },
])

// 公告数据
const announcementItems = ref([
  { id: 1, title: '优伴AI 2.0版本上线公告', author: '管理员', date: '2026-06-20', status: 'published' },
  { id: 2, title: '关于新增AI辅导功能的说明', author: '管理员', date: '2026-06-15', status: 'published' },
  { id: 3, title: '系统维护通知', author: '管理员', date: '2026-06-10', status: 'draft' },
])

// 过滤
const filteredAssessment = computed(() => {
  if (!searchAssessment.value) return assessmentItems.value
  return assessmentItems.value.filter(i => i.title.includes(searchAssessment.value))
})
const filteredPractice = computed(() => {
  if (!searchPractice.value) return practiceItems.value
  return practiceItems.value.filter(i => i.name.includes(searchPractice.value))
})
const filteredResources = computed(() => {
  if (!searchResource.value) return resourceItems.value
  return resourceItems.value.filter(i => i.name.includes(searchResource.value))
})
const filteredAnnouncements = computed(() => {
  if (!searchAnnouncement.value) return announcementItems.value
  return announcementItems.value.filter(i => i.title.includes(searchAnnouncement.value))
})

// 弹窗
const dialogVisible = ref(false)
const dialogType = ref('')
const isEditing = ref(false)
const editingId = ref(null)
const formData = ref({})

const dialogTitle = computed(() => {
  const typeMap = { assessment: '测评题目', practice: '实践项目', resource: '资源', announcement: '公告' }
  const prefix = isEditing.value ? '编辑' : '添加'
  return `${prefix}${typeMap[dialogType.value] || ''}`
})

function openDialog(type) {
  dialogType.value = type
  isEditing.value = false
  formData.value = { status: 'published' }
  dialogVisible.value = true
}

function editItem(row, type) {
  dialogType.value = type
  isEditing.value = true
  editingId.value = row.id
  formData.value = { ...row }
  dialogVisible.value = true
}

function saveDialog() {
  const dataMap = {
    assessment: assessmentItems,
    practice: practiceItems,
    resource: resourceItems,
    announcement: announcementItems,
  }
  const items = dataMap[dialogType.value]
  if (!items) return

  if (isEditing.value) {
    const idx = items.value.findIndex(i => i.id === editingId.value)
    if (idx !== -1) {
      items.value[idx] = { ...items.value[idx], ...formData.value }
    }
    ElMessage.success('编辑成功')
  } else {
    const newId = Math.max(0, ...items.value.map(i => i.id)) + 1
    items.value.unshift({ id: newId, ...formData.value })
    ElMessage.success('添加成功')
  }
  dialogVisible.value = false
}

function deleteItem(row, type) {
  const dataMap = {
    assessment: assessmentItems,
    practice: practiceItems,
    resource: resourceItems,
    announcement: announcementItems,
  }
  const items = dataMap[type]
  if (items) {
    const idx = items.value.findIndex(i => i.id === row.id)
    if (idx !== -1) items.value.splice(idx, 1)
    ElMessage.success('删除成功')
  }
}

function toggleStatus(row, type) {
  const label = row.status === 'published' ? '已上架' : '已下架'
  ElMessage.success(label)
}

function resourceTypeTag(type) {
  const map = { '文档': 'info', '视频': '', '音频': 'warning', '图片': 'success' }
  return map[type] || 'info'
}
</script>

<style scoped>
.admin-content {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 20px;
}
.page-header h2 {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
}

.content-tabs {
  background: var(--bg-card);
  border-radius: var(--radius);
  padding: 0 4px;
  border: 1px solid var(--border);
}

.tab-toolbar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  align-items: center;
}
.toolbar-search {
  width: 260px;
}

.content-table {
  margin-bottom: 16px;
}

@media (max-width: 768px) {
  .tab-toolbar {
    flex-direction: column;
  }
  .toolbar-search {
    width: 100%;
  }
}
</style>