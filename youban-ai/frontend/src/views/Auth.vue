<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-header">
        <div class="logo">
          <span class="logo-icon">✨</span>
          <span class="logo-text">优伴AI</span>
        </div>
        <p class="auth-subtitle">发现天赋优势，精准高效成长</p>
      </div>

      <el-tabs v-model="activeTab" class="auth-tabs">
        <el-tab-pane label="登录" name="login">
          <el-form :model="loginForm" :rules="loginRules" ref="loginFormRef" label-position="top">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="loginForm.username" placeholder="请输入用户名" prefix-icon="User" />
            </el-form-item>
            <el-form-item label="密码" prop="password">
              <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" prefix-icon="Lock" show-password />
            </el-form-item>
            <el-button type="primary" class="submit-btn" @click="handleLogin" :loading="loading">
              登 录
            </el-button>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="注册" name="register">
          <el-form :model="registerForm" :rules="registerRules" ref="registerFormRef" label-position="top">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="registerForm.username" placeholder="3-20位字符" prefix-icon="User" />
            </el-form-item>
            <el-form-item label="昵称" prop="nickname">
              <el-input v-model="registerForm.nickname" placeholder="如何称呼你？" prefix-icon="EditPen" />
            </el-form-item>
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="registerForm.phone" placeholder="请输入11位手机号" prefix-icon="Phone" />
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="registerForm.email" placeholder="选填，用于找回密码" prefix-icon="Message" />
            </el-form-item>
            <el-form-item label="密码" prop="password">
              <el-input v-model="registerForm.password" type="password" placeholder="至少6位密码" prefix-icon="Lock" show-password />
            </el-form-item>
            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input v-model="registerForm.confirmPassword" type="password" placeholder="再次输入密码" prefix-icon="Lock" show-password />
            </el-form-item>
            <el-button type="primary" class="submit-btn" @click="handleRegister" :loading="loading">
              注 册
            </el-button>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import request from '@/api/request.js'

const router = useRouter()
const activeTab = ref('login')
const loading = ref(false)
const loginFormRef = ref(null)
const registerFormRef = ref(null)

const loginForm = reactive({ username: '', password: '' })
const loginRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

const registerForm = reactive({ username: '', nickname: '', phone: '', email: '', password: '', confirmPassword: '' })
const registerRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度应为3-20个字符', trigger: 'blur' },
  ],
  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' },
  ],
  email: [
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== registerForm.password) {
          callback(new Error('两次密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
}

async function handleLogin() {
  const valid = await loginFormRef.value.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    const res = await request.post('/auth/login', {
      username: loginForm.username,
      password: loginForm.password,
    })
    if (res.code === 0) {
      localStorage.setItem('youban_token', res.data.token)
      localStorage.setItem('youban_user', JSON.stringify(res.data.user))
      ElMessage.success(res.message || '登录成功')
      router.push('/home')
    }
  } catch (e) {
    // Error handled by interceptor
  } finally {
    loading.value = false
  }
}

async function handleRegister() {
  const valid = await registerFormRef.value.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    const res = await request.post('/auth/register', {
      username: registerForm.username,
      nickname: registerForm.nickname,
      phone: registerForm.phone,
      email: registerForm.email || undefined,
      password: registerForm.password,
    })
    if (res.code === 0) {
      localStorage.setItem('youban_token', res.data.token)
      localStorage.setItem('youban_user', JSON.stringify(res.data.user))
      ElMessage.success(res.message || '注册成功')
      router.push('/home')
    }
  } catch (e) {
    // Error handled by interceptor
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.auth-card {
  width: 100%;
  max-width: 420px;
  background: #fff;
  border-radius: 16px;
  padding: 40px 36px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.auth-header {
  text-align: center;
  margin-bottom: 28px;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.logo-icon {
  font-size: 32px;
}

.logo-text {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
}

.auth-subtitle {
  color: #909399;
  margin-top: 8px;
  font-size: 14px;
}

.auth-tabs :deep(.el-tabs__header) {
  margin-bottom: 8px;
}

.auth-tabs :deep(.el-tabs__nav) {
  width: 100%;
  display: flex;
}

.auth-tabs :deep(.el-tabs__item) {
  flex: 1;
  text-align: center;
  font-size: 16px;
}

.submit-btn {
  width: 100%;
  height: 44px;
  font-size: 16px;
  margin-top: 8px;
}
</style>