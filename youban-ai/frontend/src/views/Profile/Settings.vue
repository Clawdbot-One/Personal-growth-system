<template>
  <AppLayout>
    <div class="settings-page">
      <h2 class="page-title">设置</h2>

      <!-- 个人信息 -->
      <section class="settings-section card">
        <h3 class="section-title">
          <el-icon><UserFilled /></el-icon>
          个人信息
        </h3>
        <el-form :model="profileForm" label-position="top" class="settings-form">
          <div class="avatar-row">
            <el-avatar :size="64" icon="UserFilled" />
            <el-button type="primary" plain size="small">更换头像</el-button>
          </div>
          <el-form-item label="昵称">
            <el-input v-model="profileForm.nickname" placeholder="请输入昵称" maxlength="20" show-word-limit />
          </el-form-item>
          <el-form-item label="个人简介">
            <el-input
              v-model="profileForm.bio"
              type="textarea"
              :rows="3"
              placeholder="简单介绍一下自己..."
              maxlength="200"
              show-word-limit
            />
          </el-form-item>
          <el-button type="primary" @click="saveProfile">保存修改</el-button>
        </el-form>
      </section>

      <!-- 账号安全 -->
      <section class="settings-section card">
        <h3 class="section-title">
          <el-icon><Lock /></el-icon>
          账号安全
        </h3>
        <el-form :model="securityForm" label-position="top" class="settings-form">
          <el-form-item label="手机号">
            <div class="form-row-inline">
              <el-input v-model="securityForm.phone" disabled />
              <el-button type="primary" plain size="default">更换</el-button>
            </div>
          </el-form-item>
          <el-form-item label="修改密码">
            <el-input v-model="securityForm.oldPassword" type="password" placeholder="当前密码" show-password />
          </el-form-item>
          <el-form-item>
            <el-input v-model="securityForm.newPassword" type="password" placeholder="新密码" show-password />
          </el-form-item>
          <el-form-item>
            <el-input v-model="securityForm.confirmPassword" type="password" placeholder="确认新密码" show-password />
          </el-form-item>
          <el-button type="primary" @click="saveSecurity">更新密码</el-button>
        </el-form>
      </section>

      <!-- 偏好设置 -->
      <section class="settings-section card">
        <h3 class="section-title">
          <el-icon><Setting /></el-icon>
          偏好设置
        </h3>
        <div class="preferences-list">
          <div class="pref-item">
            <div class="pref-info">
              <span class="pref-label">深色模式</span>
              <span class="pref-desc">切换深色/浅色主题</span>
            </div>
            <el-switch
              v-model="preferences.darkMode"
              @change="toggleTheme"
              :active-color="'#2563EB'"
            />
          </div>
          <div class="pref-item">
            <div class="pref-info">
              <span class="pref-label">消息通知</span>
              <span class="pref-desc">接收成长提醒和系统通知</span>
            </div>
            <el-switch
              v-model="preferences.notifications"
              :active-color="'#2563EB'"
            />
          </div>
          <div class="pref-item">
            <div class="pref-info">
              <span class="pref-label">每日成长提醒</span>
              <span class="pref-desc">每天推送实践打卡提醒</span>
            </div>
            <el-switch
              v-model="preferences.dailyReminder"
              :active-color="'#2563EB'"
            />
          </div>
          <div class="pref-item">
            <div class="pref-info">
              <span class="pref-label">字体大小</span>
              <span class="pref-desc">调整界面文字大小</span>
            </div>
            <el-radio-group v-model="preferences.fontSize" size="small">
              <el-radio-button label="small">小</el-radio-button>
              <el-radio-button label="medium">中</el-radio-button>
              <el-radio-button label="large">大</el-radio-button>
            </el-radio-group>
          </div>
        </div>
      </section>

      <!-- 隐私设置 -->
      <section class="settings-section card">
        <h3 class="section-title">
          <el-icon><View /></el-icon>
          隐私设置
        </h3>
        <div class="preferences-list">
          <div class="pref-item">
            <div class="pref-info">
              <span class="pref-label">公开成长档案</span>
              <span class="pref-desc">允许其他用户查看你的成长数据</span>
            </div>
            <el-switch v-model="privacy.publicArchive" :active-color="'#2563EB'" />
          </div>
          <div class="pref-item">
            <div class="pref-info">
              <span class="pref-label">显示测评结果</span>
              <span class="pref-desc">允许展示你的优势测评结果</span>
            </div>
            <el-switch v-model="privacy.showAssessment" :active-color="'#2563EB'" />
          </div>
          <div class="pref-item">
            <div class="pref-info">
              <span class="pref-label">数据收集</span>
              <span class="pref-desc">允许收集匿名使用数据以改进服务</span>
            </div>
            <el-switch v-model="privacy.dataCollection" :active-color="'#2563EB'" />
          </div>
        </div>
      </section>

      <!-- 退出登录 -->
      <div class="logout-section">
        <el-popconfirm
          title="确定要退出登录吗？"
          confirm-button-text="确定"
          cancel-button-text="取消"
          @confirm="handleLogout"
        >
          <template #reference>
            <el-button type="danger" plain size="large" class="logout-btn">
              <el-icon><SwitchButton /></el-icon>
              退出登录
            </el-button>
          </template>
        </el-popconfirm>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import AppLayout from '@/components/layout/AppLayout.vue'

const router = useRouter()
const userStore = useUserStore()

const profileForm = reactive({
  nickname: userStore.user?.nickname || '',
  bio: '',
})

const securityForm = reactive({
  phone: userStore.user?.phone || '138****8888',
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const preferences = reactive({
  darkMode: userStore.isDark,
  notifications: true,
  dailyReminder: true,
  fontSize: 'medium',
})

const privacy = reactive({
  publicArchive: false,
  showAssessment: true,
  dataCollection: true,
})

function saveProfile() {
  userStore.updateProfile({ nickname: profileForm.nickname, bio: profileForm.bio })
  ElMessage.success('个人信息已保存')
}

function saveSecurity() {
  if (!securityForm.oldPassword) {
    ElMessage.warning('请输入当前密码')
    return
  }
  if (securityForm.newPassword !== securityForm.confirmPassword) {
    ElMessage.warning('两次密码不一致')
    return
  }
  ElMessage.success('密码已更新')
  securityForm.oldPassword = ''
  securityForm.newPassword = ''
  securityForm.confirmPassword = ''
}

function toggleTheme(val) {
  userStore.toggleTheme()
}

function handleLogout() {
  userStore.logout()
  ElMessage.success('已退出登录')
  router.push('/')
}
</script>

<style scoped>
.settings-page {
  max-width: 720px;
  margin: 0 auto;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 24px;
}

.settings-section {
  padding: 24px;
  margin-bottom: 20px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 20px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--border);
}

.settings-form {
  max-width: 480px;
}

.avatar-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.form-row-inline {
  display: flex;
  gap: 12px;
  align-items: center;
}
.form-row-inline .el-input {
  flex: 1;
}

/* 偏好列表 */
.preferences-list {
  display: flex;
  flex-direction: column;
}
.pref-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom: 1px solid var(--border);
}
.pref-item:last-child {
  border-bottom: none;
}
.pref-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.pref-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}
.pref-desc {
  font-size: 12px;
  color: var(--text-muted);
}

/* 退出 */
.logout-section {
  padding: 24px 0;
  text-align: center;
}
.logout-btn {
  min-width: 200px;
}

/* 响应式 */
@media (max-width: 768px) {
  .settings-section {
    padding: 16px;
  }
  .settings-form {
    max-width: 100%;
  }
}
</style>