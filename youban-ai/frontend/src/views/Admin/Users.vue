<template>
  <div class="admin-users">
    <div class="page-header">
      <h2>用户管理</h2>
        <el-button type="primary">
          <el-icon><Plus /></el-icon>
          添加用户
        </el-button>
      </div>

      <!-- 搜索筛选 -->
      <section class="filter-bar card">
        <div class="filter-row">
          <el-input
            v-model="searchQuery"
            placeholder="搜索用户昵称/手机号..."
            :prefix-icon="Search"
            clearable
            class="search-input"
          />
          <el-select v-model="memberFilter" placeholder="会员等级" clearable class="filter-select">
            <el-option label="全部" value="" />
            <el-option label="免费版" value="free" />
            <el-option label="高级版" value="premium" />
            <el-option label="VIP会员" value="vip" />
          </el-select>
          <el-select v-model="statusFilter" placeholder="账号状态" clearable class="filter-select">
            <el-option label="全部" value="" />
            <el-option label="正常" value="active" />
            <el-option label="已封禁" value="banned" />
          </el-select>
          <el-button type="primary" plain @click="resetFilters">重置</el-button>
        </div>
      </section>

      <!-- 用户表格 -->
      <section class="table-section card">
        <el-table :data="members" style="width: 100%" stripe v-loading="loading">
          <el-table-column label="头像" width="70">
            <template #default>
              <el-avatar :size="36" icon="UserFilled" />
            </template>
          </el-table-column>
          <el-table-column prop="nickname" label="昵称" min-width="120" />
          <el-table-column prop="username" label="用户名" width="130" />
          <el-table-column label="会员等级" width="110">
            <template #default="{ row }">
              <el-tag :type="memberTagType(row.memberLevel)" size="small" effect="dark">
                {{ memberLabel(row.memberLevel) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="注册时间" width="120" />
          <el-table-column prop="lastLoginAt" label="最后登录" width="160" />
          <el-table-column label="学习数据" width="140">
            <template #default="{ row }">
              <span class="stat-text">任务: {{ row.stats?.completedTasks || 0 }}</span>
              <span class="stat-text">天数: {{ row.stats?.consecutiveDays || 0 }}</span>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="80">
            <template #default="{ row }">
              <el-tag :type="row.status === 'active' ? 'success' : 'danger'" size="small" effect="plain">
                {{ row.status === 'active' ? '正常' : '已封禁' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="220" fixed="right">
            <template #default="{ row }">
              <el-button text type="primary" size="small" @click="showDetail(row)">查看</el-button>
              <el-button text type="warning" size="small" @click="openEdit(row)">编辑</el-button>
              <el-popconfirm
                :title="row.status === 'active' ? '确定封禁该用户？' : '确定解禁该用户？'"
                @confirm="toggleBan(row)"
              >
                <template #reference>
                  <el-button text :type="row.status === 'active' ? 'danger' : 'success'" size="small">
                    {{ row.status === 'active' ? '封禁' : '解禁' }}
                  </el-button>
                </template>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
      </section>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="total"
          layout="total, prev, pager, next"
          background
          @current-change="fetchMembers"
        />
      </div>

      <!-- 用户详情弹窗 -->
      <el-dialog v-model="detailVisible" title="用户详情" width="560px">
        <div v-if="currentUser" class="user-detail">
          <div class="detail-header">
            <el-avatar :size="56" icon="UserFilled" />
            <div>
              <h3>{{ currentUser.nickname }}</h3>
              <el-tag :type="memberTagType(currentUser.memberLevel)" size="small">
                {{ memberLabel(currentUser.memberLevel) }}
              </el-tag>
            </div>
          </div>
          <el-descriptions :column="1" border class="detail-desc">
            <el-descriptions-item label="用户名">{{ currentUser.username }}</el-descriptions-item>
            <el-descriptions-item label="邮箱">{{ currentUser.email || '未设置' }}</el-descriptions-item>
            <el-descriptions-item label="手机号">{{ currentUser.phone || '未设置' }}</el-descriptions-item>
            <el-descriptions-item label="注册时间">{{ currentUser.createdAt }}</el-descriptions-item>
            <el-descriptions-item label="最后登录">{{ currentUser.lastLoginAt }}</el-descriptions-item>
            <el-descriptions-item label="学习时长">{{ currentUser.stats?.totalHours || 0 }} 小时</el-descriptions-item>
            <el-descriptions-item label="连续天数">{{ currentUser.stats?.consecutiveDays || 0 }} 天</el-descriptions-item>
            <el-descriptions-item label="完成成就">{{ currentUser.stats?.achievements || 0 }} 个</el-descriptions-item>
            <el-descriptions-item label="测评次数">{{ currentUser.counts?.assessments || 0 }} 次</el-descriptions-item>
            <el-descriptions-item label="实践任务">{{ currentUser.counts?.practices || 0 }} 次</el-descriptions-item>
            <el-descriptions-item label="成长目标">{{ currentUser.counts?.goals || 0 }} 个</el-descriptions-item>
            <el-descriptions-item label="账号状态">
              <el-tag :type="currentUser.status === 'active' ? 'success' : 'danger'" size="small">
                {{ currentUser.status === 'active' ? '正常' : '已封禁' }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>
          <div v-if="currentUser.strengths" class="strength-section">
            <h4>优势画像</h4>
            <div class="strength-tags">
              <el-tag v-for="s in currentUser.strengths.top5" :key="s" type="success" size="small">{{ s }}</el-tag>
            </div>
            <div class="score-grid">
              <div class="score-item">
                <span class="score-label">天赋</span>
                <span class="score-value">{{ currentUser.strengths.scores.talent }}</span>
              </div>
              <div class="score-item">
                <span class="score-label">技能</span>
                <span class="score-value">{{ currentUser.strengths.scores.skill }}</span>
              </div>
              <div class="score-item">
                <span class="score-label">品格</span>
                <span class="score-value">{{ currentUser.strengths.scores.character }}</span>
              </div>
              <div class="score-item">
                <span class="score-label">价值观</span>
                <span class="score-value">{{ currentUser.strengths.scores.value }}</span>
              </div>
            </div>
          </div>
        </div>
        <template #footer>
          <el-button @click="detailVisible = false">关闭</el-button>
        </template>
      </el-dialog>

      <!-- 编辑用户弹窗 -->
      <el-dialog v-model="editVisible" title="编辑用户" width="500px" @close="resetEditForm">
        <el-form
          ref="editFormRef"
          :model="editForm"
          :rules="editRules"
          label-width="90px"
          label-position="right"
        >
          <el-form-item label="用户名">
            <el-input :model-value="editForm.username" disabled />
          </el-form-item>
          <el-form-item label="昵称" prop="nickname">
            <el-input v-model="editForm.nickname" maxlength="20" show-word-limit />
          </el-form-item>
          <el-form-item label="手机号" prop="phone">
            <el-input v-model="editForm.phone" maxlength="11" placeholder="请输入手机号" />
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="editForm.email" placeholder="请输入邮箱" />
          </el-form-item>
          <el-form-item label="会员等级" prop="memberLevel">
            <el-select v-model="editForm.memberLevel" style="width: 100%">
              <el-option label="免费版" value="free" />
              <el-option label="高级版" value="premium" />
              <el-option label="VIP会员" value="vip" />
            </el-select>
          </el-form-item>
          <el-form-item label="账号状态" prop="status">
            <el-select v-model="editForm.status" style="width: 100%">
              <el-option label="正常" value="active" />
              <el-option label="已封禁" value="banned" />
            </el-select>
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="editVisible = false">取消</el-button>
          <el-button type="primary" :loading="editLoading" @click="submitEdit">保存</el-button>
        </template>
      </el-dialog>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import request from '@/api/request.js'

const searchQuery = ref('')
const memberFilter = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const members = ref([])
const loading = ref(false)

async function fetchMembers() {
  loading.value = true
  try {
    const res = await request.get('/admin/members', {
      params: {
        page: currentPage.value,
        pageSize: pageSize.value,
        keyword: searchQuery.value || undefined,
        level: memberFilter.value || undefined,
        status: statusFilter.value || undefined,
      },
    })
    if (res.code === 0) {
      members.value = res.data.list
      total.value = res.data.total
    }
  } catch {
    // Error handled by interceptor
  } finally {
    loading.value = false
  }
}

onMounted(() => fetchMembers())
watch([currentPage, searchQuery, memberFilter, statusFilter], () => {
  currentPage.value = 1
  fetchMembers()
})

function resetFilters() {
  searchQuery.value = ''
  memberFilter.value = ''
  statusFilter.value = ''
}

function memberLabel(level) {
  const map = { free: '免费版', premium: '高级版', vip: 'VIP会员' }
  return map[level] || '免费版'
}
function memberTagType(level) {
  const map = { free: 'info', premium: 'warning', vip: 'danger' }
  return map[level] || 'info'
}

// 详情弹窗
const detailVisible = ref(false)
const currentUser = ref(null)

async function showDetail(row) {
  try {
    const res = await request.get(`/admin/members/${row.id}`)
    if (res.code === 0) {
      currentUser.value = res.data
      detailVisible.value = true
    }
  } catch {
    // Error handled by interceptor
  }
}

// 封禁/解禁
async function toggleBan(row) {
  const newStatus = row.status === 'active' ? 'banned' : 'active'
  try {
    const res = await request.put(`/admin/members/${row.id}`, { status: newStatus })
    if (res.code === 0) {
      row.status = newStatus
      ElMessage.success(newStatus === 'active' ? '已解禁' : '已封禁')
    }
  } catch {
    // Error handled by interceptor
  }
}

// ========== 编辑用户 ==========
const editVisible = ref(false)
const editLoading = ref(false)
const editFormRef = ref(null)
const editForm = ref({
  id: null,
  username: '',
  nickname: '',
  phone: '',
  email: '',
  memberLevel: 'free',
  status: 'active',
})

const phonePattern = /^1[3-9]\d{9}$/
const editRules = {
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 20, message: '昵称长度为2-20个字符', trigger: 'blur' },
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: phonePattern, message: '请输入正确的手机号', trigger: 'blur' },
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' },
  ],
  memberLevel: [
    { required: true, message: '请选择会员等级', trigger: 'change' },
  ],
  status: [
    { required: true, message: '请选择账号状态', trigger: 'change' },
  ],
}

function openEdit(row) {
  editForm.value = {
    id: row.id,
    username: row.username,
    nickname: row.nickname,
    phone: row.phone || '',
    email: row.email || '',
    memberLevel: row.memberLevel,
    status: row.status,
  }
  editVisible.value = true
}

function resetEditForm() {
  editFormRef.value?.resetFields()
}

async function submitEdit() {
  const valid = await editFormRef.value.validate().catch(() => false)
  if (!valid) return

  editLoading.value = true
  try {
    const res = await request.put(`/admin/members/${editForm.value.id}`, {
      nickname: editForm.value.nickname,
      phone: editForm.value.phone,
      email: editForm.value.email,
      memberLevel: editForm.value.memberLevel,
      status: editForm.value.status,
    })
    if (res.code === 0) {
      ElMessage.success('用户信息已更新')
      editVisible.value = false
      fetchMembers()
    }
  } catch {
    // Error handled by interceptor
  } finally {
    editLoading.value = false
  }
}
</script>

<style scoped>
.admin-users {
  max-width: 1200px;
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

.filter-bar {
  padding: 16px 20px;
  margin-bottom: 16px;
}
.filter-row {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}
.search-input {
  width: 280px;
}
.filter-select {
  width: 140px;
}

.table-section {
  padding: 4px;
  margin-bottom: 16px;
  overflow: hidden;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  padding: 8px 0;
}

/* 用户详情 */
.user-detail {
  padding: 4px 0;
}
.detail-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}
.detail-header h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 4px;
}

/* 标签编辑 */
.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}
.tag-item {
  margin-right: 0;
}

/* 响应式 */
@media (max-width: 768px) {
  .filter-row {
    flex-direction: column;
  }
  .search-input {
    width: 100%;
  }
  .filter-select {
    width: 100%;
  }
}

.stat-text {
  display: block;
  font-size: 12px;
  color: #909399;
  line-height: 1.6;
}

.strength-section {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #ebeef5;
}

.strength-section h4 {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 10px;
  color: #303133;
}

.strength-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}

.score-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.score-item {
  text-align: center;
  padding: 8px 4px;
  background: #f5f7fa;
  border-radius: 8px;
}

.score-label {
  display: block;
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.score-value {
  font-size: 18px;
  font-weight: 700;
  color: #409eff;
}
</style>