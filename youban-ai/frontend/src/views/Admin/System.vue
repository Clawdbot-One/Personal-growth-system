<template>
  <div class="admin-system">
    <div class="page-header">
      <h2>系统配置</h2>
    </div>

    <!-- AI 参数配置 -->
    <section class="config-section card">
      <h3 class="section-title">
        <el-icon><Cpu /></el-icon>
        AI 参数配置
      </h3>
      <el-form :model="aiConfig" label-position="top" class="config-form">
        <el-form-item label="模型温度 (Temperature)">
          <el-slider v-model="aiConfig.temperature" :min="0" :max="2" :step="0.1" :show-input="true" />
          <span class="form-hint">控制生成内容的随机性，值越高结果越多样</span>
        </el-form-item>
        <el-form-item label="最大 Token 数">
          <el-input-number v-model="aiConfig.maxTokens" :min="256" :max="8192" :step="256" />
          <span class="form-hint-inline">单次对话的最大输出长度</span>
        </el-form-item>
        <el-form-item label="Top-P 采样">
          <el-slider v-model="aiConfig.topP" :min="0" :max="1" :step="0.05" :show-input="true" />
          <span class="form-hint">核采样参数，控制生成内容的多样性</span>
        </el-form-item>
        <el-form-item label="系统提示词">
          <el-input v-model="aiConfig.systemPrompt" type="textarea" :rows="4" placeholder="输入AI助手的系统提示词..." />
        </el-form-item>
        <el-button type="primary" @click="saveConfig('ai')">保存 AI 配置</el-button>
      </el-form>
    </section>

    <!-- 通知配置 -->
    <section class="config-section card">
      <h3 class="section-title">
        <el-icon><Bell /></el-icon>
        通知配置
      </h3>
      <el-form :model="notifyConfig" label-position="top" class="config-form">
        <el-form-item label="推送通知">
          <el-switch v-model="notifyConfig.pushEnabled" active-text="开启" inactive-text="关闭" />
        </el-form-item>
        <el-form-item label="短信通知">
          <el-switch v-model="notifyConfig.smsEnabled" active-text="开启" inactive-text="关闭" />
        </el-form-item>
        <el-form-item label="邮件通知">
          <el-switch v-model="notifyConfig.emailEnabled" active-text="开启" inactive-text="关闭" />
        </el-form-item>
        <el-form-item label="每日推送时间">
          <el-select v-model="notifyConfig.pushTime" placeholder="选择时间">
            <el-option v-for="t in timeOptions" :key="t" :label="t" :value="t" />
          </el-select>
        </el-form-item>
        <el-form-item label="通知模板">
          <el-input v-model="notifyConfig.template" type="textarea" :rows="3" placeholder="使用 {{name}} 等变量占位..." />
        </el-form-item>
        <el-button type="primary" @click="saveConfig('notify')">保存通知配置</el-button>
      </el-form>
    </section>

    <!-- 积分与权益 -->
    <section class="config-section card">
      <h3 class="section-title">
        <el-icon><Coin /></el-icon>
        积分与权益
      </h3>
      <el-form :model="pointsConfig" label-position="top" class="config-form">
        <div class="points-grid">
          <el-form-item label="每日签到积分">
            <el-input-number v-model="pointsConfig.dailyCheckin" :min="1" :max="100" />
          </el-form-item>
          <el-form-item label="完成测评积分">
            <el-input-number v-model="pointsConfig.assessmentComplete" :min="10" :max="500" :step="10" />
          </el-form-item>
          <el-form-item label="实践打卡积分">
            <el-input-number v-model="pointsConfig.practiceCheckin" :min="5" :max="200" :step="5" />
          </el-form-item>
          <el-form-item label="邀请好友积分">
            <el-input-number v-model="pointsConfig.inviteFriend" :min="10" :max="500" :step="10" />
          </el-form-item>
        </div>
        <el-form-item label="高级会员权益">
          <el-checkbox-group v-model="pointsConfig.benefits" class="benefits-list">
            <el-checkbox label="ai_assistant">AI助手无限使用</el-checkbox>
            <el-checkbox label="full_report">完整测评报告</el-checkbox>
            <el-checkbox label="expert_consult">专家咨询服务</el-checkbox>
            <el-checkbox label="priority_support">优先技术支持</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-button type="primary" @click="saveConfig('points')">保存积分配置</el-button>
      </el-form>
    </section>

    <!-- 版本管理 -->
    <section class="config-section card">
      <h3 class="section-title">
        <el-icon><Monitor /></el-icon>
        版本管理
      </h3>
      <el-form :model="versionConfig" label-position="top" class="config-form">
        <div class="version-grid">
          <el-form-item label="当前版本">
            <el-input v-model="versionConfig.currentVersion" disabled />
          </el-form-item>
          <el-form-item label="最新版本">
            <el-input v-model="versionConfig.latestVersion" placeholder="v2.1.0" />
          </el-form-item>
          <el-form-item label="最低支持版本">
            <el-input v-model="versionConfig.minVersion" placeholder="v1.5.0" />
          </el-form-item>
          <el-form-item label="强制更新">
            <el-switch v-model="versionConfig.forceUpdate" active-text="是" inactive-text="否" />
          </el-form-item>
        </div>
        <el-form-item label="更新日志">
          <el-input v-model="versionConfig.changelog" type="textarea" :rows="4" placeholder="请输入版本更新内容..." />
        </el-form-item>
        <el-form-item label="下载地址">
          <el-input v-model="versionConfig.downloadUrl" placeholder="https://..." />
        </el-form-item>
        <el-button type="primary" @click="saveConfig('version')">保存版本配置</el-button>
      </el-form>
    </section>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'

const aiConfig = reactive({
  temperature: 0.7,
  maxTokens: 2048,
  topP: 0.9,
  systemPrompt: '你是一个专业的个人成长AI助手，帮助用户发现天赋优势、制定成长计划。回答时请保持专业、温暖、鼓励的语气。',
})

const timeOptions = computed(() => {
  const times = []
  for (let h = 6; h <= 23; h++) {
    for (let m = 0; m < 60; m += 30) {
      times.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
    }
  }
  return times
})

const notifyConfig = reactive({
  pushEnabled: true,
  smsEnabled: false,
  emailEnabled: true,
  pushTime: '08:00',
  template: 'Hi {{name}}，今天是你连续成长的第{{days}}天，继续加油！点击查看今日推荐 →',
})

const pointsConfig = reactive({
  dailyCheckin: 5,
  assessmentComplete: 50,
  practiceCheckin: 10,
  inviteFriend: 30,
  benefits: ['ai_assistant', 'full_report'],
})

const versionConfig = reactive({
  currentVersion: 'v2.0.0',
  latestVersion: 'v2.1.0',
  minVersion: 'v1.5.0',
  forceUpdate: false,
  changelog: '- 新增AI成长助手对话功能\n- 优化实践库搜索体验\n- 修复已知问题，提升稳定性',
  downloadUrl: 'https://youban-ai.com/download',
})

function saveConfig(section) {
  const messages = {
    ai: 'AI 参数配置已保存',
    notify: '通知配置已保存',
    points: '积分与权益配置已保存',
    version: '版本管理配置已保存',
  }
  ElMessage.success(messages[section] || '配置已保存')
}
</script>

<style scoped>
.admin-system {
  max-width: 900px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 24px;
}
.page-header h2 {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
}

.config-section {
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

.config-form {
  max-width: 640px;
}

.form-hint {
  font-size: 12px;
  color: var(--text-muted);
  display: block;
  margin-top: 4px;
}
.form-hint-inline {
  font-size: 12px;
  color: var(--text-muted);
  margin-left: 12px;
}

.points-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 24px;
}

.benefits-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.version-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 24px;
}

@media (max-width: 768px) {
  .config-section {
    padding: 16px;
  }
  .config-form {
    max-width: 100%;
  }
  .points-grid,
  .version-grid {
    grid-template-columns: 1fr;
  }
}
</style>