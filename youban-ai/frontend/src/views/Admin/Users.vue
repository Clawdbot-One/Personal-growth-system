<template>
  <AppLayout>
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
          <el-select v-model="memberFilter" placeholder="会员状态" clearable class="filter-select">
            <el-option label="全部" value="" />
            <el-option label="免费版" value="free" />
            <el-option label="高级版" value="pro" />
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
        <el-table :data="filteredUsers" style="width: 100%" stripe>
          <el-table-column label="头像" width="70">
            <template #default>
              <el-avatar :size="36" icon="UserFilled" />
            </template>
          </el-table-column>
          <el-table-column prop="nickname" label="昵称" min-width="120" />
          <el-table-column prop="phone" label="手机号" width="130" />
          <el-table-column label="会员状态" width="110">
            <template #default="{ row }">
              <el-tag :type="memberTagType(row.memberLevel)" size="small" effect="dark">
                {{ memberLabel(row.memberLevel) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="registerDate" label="注册时间" width="120" />
          <el-table-column prop="lastLogin" label="最后登录" width="160" />
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
              <el-button text size="small" @click="editTags(row)">标签</el-button>
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
          :total="totalUsers"
          layout="total, prev, pager, next"
          background
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
            <el-descriptions-item label="手机号">{{ currentUser.phone }}</el-descriptions-item>
            <el-descriptions-item label="注册时间">{{ currentUser.registerDate }}</el-descriptions-item>
            <el-descriptions-item label="最后登录">{{ currentUser.lastLogin }}</el-descriptions-item>
            <el-descriptions-item label="测评次数">{{ currentUser.assessmentCount || 0 }}</el-descriptions-item>
            <el-descriptions-item label="实践任务">{{ currentUser.practiceCount || 0 }}</el-descriptions-item>
            <el-descriptions-item label="账号状态">
              <el-tag :type="currentUser.status === 'active' ? 'success' : 'danger'" size="small">
                {{ currentUser.status === 'active' ? '正常' : '已封禁' }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </div>
        <template #footer>
          <el-button @click="detailVisible = false">关闭</el-button>
        </template>
      </el-dialog>

      <!-- 编辑标签弹窗 -->
      <el-dialog v-model="tagVisible" title="编辑用户标签" width="480px">
        <div v-if="currentUser" class="tag-edit">
          <el-form label-position="top">
            <el-form-item label="当前标签">
              <div class="tag-list">
                <el-tag
                  v-for="tag in currentUserTags"
                  :key="tag"
                  closable
                  @close="removeTag(tag)"
                  class="tag-item"
                >{{ tag }}</el-tag>
                <el-input
                  v-if="tagInputVisible"
                  ref="tagInputRef"
                  v-model="tagInputValue"
                  size="small"
                  @keyup.enter="addTag"
                  @blur="addTag"
                />
                <el-button v-else size="small" @click="showTagInput">+ 添加标签</el-button>
              </div>
            </el-form-item>
          </el-form>
        </div>
        <template #footer>
          <el-button @click="tagVisible = false">取消</el-button>
          <el-button type="primary" @click="saveTags">保存</el-button>
        </template>
      </el-dialog>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import AppLayout from '@/components/layout/AppLayout.vue'

const router = useRouter()

const searchQuery = ref('')
const memberFilter = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

const users = ref([
  { id: 1, nickname: '探索者小明', phone: '138****8888', memberLevel: 'free', registerDate: '2026-01-15', lastLogin: '2026-06-27 14:30', status: 'active', tags: ['新用户', '活跃'] },
  { id: 2, nickname: '职场达人李', phone: '139****9999', memberLevel: 'pro', registerDate: '2025-12-20', lastLogin: '2026-06-27 12:15', status: 'active', tags: ['高级会员'] },
  { id: 3, nickname: '学习狂人王', phone: '137****7777', memberLevel: 'vip', registerDate: '2025-10-05', lastLogin: '2026-06-27 10:22', status: 'active', tags: ['VIP', '高活跃'] },
  { id: 4, nickname: '副业探索者', phone: '136****6666', memberLevel: 'free', registerDate: '2026-02-10', lastLogin: '2026-06-26 22:45', status: 'active', tags: [] },
  { id: 5, nickname: '成长青年', phone: '135****5555', memberLevel: 'pro', registerDate: '2026-03-08', lastLogin: '2026-06-26 18:30', status: 'active', tags: ['高级会员'] },
  { id: 6, nickname: '测试用户A', phone: '134****4444', memberLevel: 'free', registerDate: '2026-05-01', lastLogin: '2026-06-20 09:00', status: 'banned', tags: ['已封禁'] },
  { id: 7, nickname: '设计师小林', phone: '133****3333', memberLevel: 'vip', registerDate: '2025-08-15', lastLogin: '2026-06-27 08:00', status: 'active', tags: ['VIP', '创作者'] },
  { id: 8, nickname: '产品经理张', phone: '132****2222', memberLevel: 'pro', registerDate: '2026-01-20', lastLogin: '2026-06-25 16:45', status: 'active', tags: ['高级会员'] },
])

const totalUsers = computed(() => filteredUsers.value.length)

const filteredUsers = computed(() => {
  let list = users.value
  if (searchQuery.value) {
    const kw = searchQuery.value.toLowerCase()
    list = list.filter(u => u.nickname.toLowerCase().includes(kw) || u.phone.includes(kw))
  }
  if (memberFilter.value) {
    list = list.filter(u => u.memberLevel === memberFilter.value)
  }
  if (statusFilter.value) {
    list = list.filter(u => u.status === statusFilter.value)
  }
  return list
})

function resetFilters() {
  searchQuery.value = ''
  memberFilter.value = ''
  statusFilter.value = ''
}

function memberLabel(level) {
  const map = { free: '免费版', pro: '高级版', vip: 'VIP会员' }
  return map[level] || '免费版'
}
function memberTagType(level) {
  const map = { free: 'info', pro: 'warning', vip: 'danger' }
  return map[level] || 'info'
}

// 详情弹窗
const detailVisible = ref(false)
const currentUser = ref(null)
function showDetail(row) {
  currentUser.value = row
  detailVisible.value = true
}

// 封禁/解禁
function toggleBan(row) {
  row.status = row.status === 'active' ? 'banned' : 'active'
  ElMessage.success(row.status === 'active' ? '已解禁' : '已封禁')
}

// 标签编辑
const tagVisible = ref(false)
const currentUserTags = ref([])
const tagInputVisible = ref(false)
const tagInputValue = ref('')
const tagInputRef = ref(null)

function editTags(row) {
  currentUser.value = row
  currentUserTags.value = [...(row.tags || [])]
  tagVisible.value = true
}
function showTagInput() {
  tagInputVisible.value = true
  nextTick(() => tagInputRef.value?.focus())
}
function addTag() {
  const val = tagInputValue.value.trim()
  if (val && !currentUserTags.value.includes(val)) {
    currentUserTags.value.push(val)
  }
  tagInputVisible.value = false
  tagInputValue.value = ''
}
function removeTag(tag) {
  currentUserTags.value = currentUserTags.value.filter(t => t !== tag)
}
function saveTags() {
  if (currentUser.value) {
    currentUser.value.tags = [...currentUserTags.value]
  }
  ElMessage.success('标签已保存')
  tagVisible.value = false
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
</style>