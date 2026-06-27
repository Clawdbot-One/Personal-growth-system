<template>
  <div class="admin-accounts">
    <div class="page-header">
      <h2>管理员账号管理</h2>
      <el-button type="primary" @click="showCreateDialog">
        <el-icon><Plus /></el-icon> 新增管理员
      </el-button>
    </div>

    <section class="card">
      <el-table :data="admins" style="width: 100%" stripe v-loading="loading">
            <el-table-column prop="username" label="用户名" width="130" />
            <el-table-column prop="nickname" label="昵称" width="130" />
            <el-table-column prop="phone" label="手机号" width="140" />
            <el-table-column prop="email" label="邮箱" min-width="180" />
            <el-table-column label="状态" width="90">
              <template #default="{ row }">
                <el-tag :type="row.status === 'active' ? 'success' : 'danger'" size="small">
                  {{ row.status === 'active' ? '正常' : '禁用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createdAt" label="创建时间" width="120" />
            <el-table-column prop="lastLoginAt" label="最后登录" width="160" />
            <el-table-column label="操作" width="220" fixed="right">
              <template #default="{ row }">
                <el-button text type="primary" size="small" @click="showResetPwd(row)">重置密码</el-button>
                <el-popconfirm
                  title="确定删除该管理员账号？"
                  confirm-button-text="删除"
                  @confirm="handleDelete(row)"
                >
                  <template #reference>
                    <el-button text type="danger" size="small">删除</el-button>
                  </template>
                </el-popconfirm>
              </template>
            </el-table-column>
          </el-table>
        </section>

    <!-- 新增管理员弹窗 -->
    <el-dialog v-model="createVisible" title="新增管理员" width="480px">
      <el-form :model="createForm" :rules="createRules" ref="createFormRef" label-position="top">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="createForm.username" placeholder="3-20位字符" />
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="createForm.nickname" placeholder="管理员昵称" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="createForm.phone" placeholder="11位手机号" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="createForm.email" placeholder="选填" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="createForm.password" type="password" placeholder="至少6位密码" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCreate" :loading="saving">确认创建</el-button>
      </template>
    </el-dialog>

    <!-- 重置密码弹窗 -->
    <el-dialog v-model="resetVisible" title="重置管理员密码" width="420px">
      <el-form :model="resetForm" ref="resetFormRef" label-position="top">
        <p class="reset-hint">正在为管理员 <strong>{{ resetTarget?.nickname }}</strong>（{{ resetTarget?.username }}）重置密码</p>
        <el-form-item label="新密码" prop="password">
          <el-input v-model="resetForm.password" type="password" placeholder="至少6位新密码" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="resetVisible = false">取消</el-button>
        <el-button type="primary" @click="handleResetPwd" :loading="saving">确认重置</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/api/request.js'

const admins = ref([])
const loading = ref(false)
const saving = ref(false)

async function fetchAdmins() {
  loading.value = true
  try {
    const res = await request.get('/admin/accounts')
    if (res.code === 0) admins.value = res.data
  } catch { /* handled by interceptor */ }
  finally { loading.value = false }
}

onMounted(fetchAdmins)

// 新增管理员
const createVisible = ref(false)
const createFormRef = ref(null)
const createForm = reactive({ username: '', nickname: '', phone: '', email: '', password: '' })
const createRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '3-20个字符', trigger: 'blur' },
  ],
  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '至少6位', trigger: 'blur' },
  ],
}

function showCreateDialog() {
  Object.assign(createForm, { username: '', nickname: '', phone: '', email: '', password: '' })
  createVisible.value = true
}

async function handleCreate() {
  const valid = await createFormRef.value.validate().catch(() => false)
  if (!valid) return
  saving.value = true
  try {
    const res = await request.post('/admin/accounts', createForm)
    if (res.code === 0) {
      ElMessage.success(res.message)
      createVisible.value = false
      fetchAdmins()
    }
  } catch { /* handled */ }
  finally { saving.value = false }
}

// 删除管理员
async function handleDelete(row) {
  try {
    const res = await request.delete(`/admin/accounts/${row.id}`)
    if (res.code === 0) {
      ElMessage.success(res.message)
      fetchAdmins()
    }
  } catch { /* handled */ }
}

// 重置密码
const resetVisible = ref(false)
const resetTarget = ref(null)
const resetForm = reactive({ password: '' })
const resetFormRef = ref(null)

function showResetPwd(row) {
  resetTarget.value = row
  resetForm.password = ''
  resetVisible.value = true
}

async function handleResetPwd() {
  if (!resetForm.password || resetForm.password.length < 6) {
    ElMessage.warning('新密码至少6位')
    return
  }
  saving.value = true
  try {
    const res = await request.put(`/admin/accounts/${resetTarget.value.id}/password`, {
      password: resetForm.password,
    })
    if (res.code === 0) {
      ElMessage.success(res.message)
      resetVisible.value = false
    }
  } catch { /* handled */ }
  finally { saving.value = false }
}
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.page-header h2 {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.card { background: #fff; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
.reset-hint { margin-bottom: 16px; color: #606266; font-size: 14px; }
</style>