<template>
  <AppLayout>
    <div class="interview-test">
      <!-- 顶部信息 -->
      <div class="interview-header">
        <button class="back-btn" @click="handleBack">
          <el-icon><ArrowLeft /></el-icon>
        </button>
        <div class="interview-title-area">
          <h2 class="interview-title">深度访谈版测评</h2>
          <span class="interview-desc">AI 对话式测评，轻松自在的深度交流</span>
        </div>
        <div class="interview-progress-badge">
          <span class="progress-current">{{ current + 1 }}</span>
          <span class="progress-sep">/</span>
          <span class="progress-total">{{ total }}</span>
        </div>
      </div>

      <!-- 对话区域 -->
      <div class="chat-area" ref="chatAreaRef">
        <!-- 开场白 -->
        <div class="chat-message ai-message intro-message">
          <div class="message-avatar">
            <el-avatar :size="40" :style="{ background: 'linear-gradient(135deg, #F97316, #FB923C)' }">
              <el-icon :size="20"><ChatDotRound /></el-icon>
            </el-avatar>
          </div>
          <div class="message-bubble">
            <p>你好！我是你的 AI 测评伙伴 ✨</p>
            <p>接下来我会问你 10 个问题，请放松心情，像和朋友聊天一样回答就好。没有标准答案，你的真实想法就是最好的回答。</p>
            <p class="intro-hint">准备好了吗？让我们开始吧 👇</p>
          </div>
        </div>

        <!-- 对话消息列表 -->
        <div
          class="chat-message"
          v-for="(msg, idx) in chatMessages"
          :key="idx"
          :class="msg.role === 'ai' ? 'ai-message' : 'user-message'"
        >
          <div class="message-avatar" v-if="msg.role === 'ai'">
            <el-avatar :size="36" :style="{ background: 'linear-gradient(135deg, #F97316, #FB923C)' }">
              <el-icon :size="18"><ChatDotRound /></el-icon>
            </el-avatar>
          </div>
          <div class="message-bubble" :class="{ 'ai-bubble': msg.role === 'ai', 'user-bubble': msg.role === 'user' }">
            <div
              v-if="msg.role === 'ai' && msg.typing"
              class="typing-indicator"
            >
              <span class="typing-dot"></span>
              <span class="typing-dot"></span>
              <span class="typing-dot"></span>
            </div>
            <p v-else>{{ msg.text }}</p>
          </div>
          <div class="message-avatar" v-if="msg.role === 'user'">
            <el-avatar :size="36" icon="UserFilled" />
          </div>
        </div>

        <!-- 完成消息 -->
        <div class="chat-message ai-message" v-if="isComplete">
          <div class="message-avatar">
            <el-avatar :size="40" :style="{ background: 'linear-gradient(135deg, #F97316, #FB923C)' }">
              <el-icon :size="20"><ChatDotRound /></el-icon>
            </el-avatar>
          </div>
          <div class="message-bubble">
            <p>感谢你的真诚分享！🎉</p>
            <p>我已经对你的回答进行了深度分析，点击下方按钮查看你的专属测评报告。</p>
          </div>
        </div>
      </div>

      <!-- 输入区域 -->
      <div class="input-area" v-if="!isComplete">
        <div class="input-wrapper">
          <el-input
            v-model="userInput"
            type="textarea"
            :rows="3"
            placeholder="在这里输入你的回答..."
            resize="none"
            :disabled="isAiTyping"
            class="chat-input"
            @keydown.enter.ctrl="sendMessage"
          />
          <div class="input-footer">
            <span class="input-hint">Ctrl + Enter 发送</span>
            <el-button
              type="primary"
              :disabled="!userInput.trim() || isAiTyping"
              :loading="isAiTyping"
              round
              @click="sendMessage"
            >
              <el-icon><Position /></el-icon>
              发送
            </el-button>
          </div>
        </div>
      </div>

      <!-- 完成后的操作 -->
      <div class="complete-actions" v-else>
        <el-button
          type="primary"
          size="large"
          round
          :loading="isGenerating"
          @click="generateAndViewReport"
        >
          <el-icon><Document /></el-icon>
          查看测评报告
        </el-button>
        <el-button
          size="large"
          round
          @click="handleRestart"
          class="restart-btn"
        >
          <el-icon><Refresh /></el-icon>
          重新访谈
        </el-button>
      </div>

      <!-- 退出确认 -->
      <el-dialog
        v-model="showExitDialog"
        title="确认退出？"
        width="380px"
        :close-on-click-modal="false"
        center
      >
        <div class="exit-dialog-body">
          <p>退出后当前访谈进度将丢失，确定要退出吗？</p>
          <p class="exit-dialog-answered">
            已完成 {{ current }} / {{ total }} 个问题
          </p>
        </div>
        <template #footer>
          <el-button @click="showExitDialog = false">继续访谈</el-button>
          <el-button type="danger" @click="confirmExit">确认退出</el-button>
        </template>
      </el-dialog>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAssessmentStore } from '@/stores/assessment'
import AppLayout from '@/components/layout/AppLayout.vue'

const router = useRouter()
const store = useAssessmentStore()

const questions = computed(() => store.interviewQuestions)
const total = computed(() => questions.value.length)
const current = ref(0)
const userInput = ref('')
const isAiTyping = ref(false)
const isComplete = ref(false)
const isGenerating = ref(false)
const showExitDialog = ref(false)
const chatAreaRef = ref(null)

const chatMessages = ref([])

onMounted(() => {
  store.startTest('interview')
  // 模拟 AI 问第一个问题
  askQuestion(0)
})

function askQuestion(index) {
  if (index >= total.value) {
    isComplete.value = true
    return
  }
  isAiTyping.value = true
  // 模拟打字延迟
  const delay = 800 + Math.random() * 600
  setTimeout(() => {
    chatMessages.value.push({
      role: 'ai',
      text: questions.value[index].text,
      typing: false,
    })
    isAiTyping.value = false
    current.value = index
    scrollToBottom()
  }, delay)
}

function sendMessage() {
  const text = userInput.value.trim()
  if (!text || isAiTyping.value) return

  // 添加用户消息
  chatMessages.value.push({
    role: 'user',
    text: text,
  })
  store.saveAnswer(questions.value[current.value].id, text)
  userInput.value = ''
  scrollToBottom()

  // 下一个问题
  const nextIdx = current.value + 1
  if (nextIdx < total.value) {
    askQuestion(nextIdx)
  } else {
    // 所有问题回答完毕
    setTimeout(() => {
      isComplete.value = true
      scrollToBottom()
    }, 600)
  }
}

function scrollToBottom() {
  nextTick(() => {
    if (chatAreaRef.value) {
      chatAreaRef.value.scrollTop = chatAreaRef.value.scrollHeight
    }
  })
}

function handleBack() {
  if (chatMessages.value.length > 0 && !isComplete.value) {
    showExitDialog.value = true
  } else {
    router.back()
  }
}

function confirmExit() {
  showExitDialog.value = false
  router.back()
}

function handleRestart() {
  chatMessages.value = []
  current.value = 0
  isComplete.value = false
  store.answers = {}
  askQuestion(0)
}

function generateAndViewReport() {
  isGenerating.value = true
  setTimeout(() => {
    const report = store.generateReport('interview')
    isGenerating.value = false
    router.push(`/assessment/report/${report.id}`)
  }, 1200)
}
</script>

<style scoped>
.interview-test {
  max-width: 680px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 180px);
}

/* 顶部 */
.interview-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 20px;
  flex-shrink: 0;
}
.back-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid var(--border);
  background: var(--bg-card);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.2s;
  flex-shrink: 0;
}
.back-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
}
.interview-title-area {
  flex: 1;
}
.interview-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
}
.interview-desc {
  font-size: 13px;
  color: var(--text-muted);
}
.interview-progress-badge {
  display: flex;
  align-items: baseline;
  gap: 2px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: white;
  border-radius: 20px;
  font-weight: 700;
  flex-shrink: 0;
}
.progress-current {
  font-size: 20px;
}
.progress-sep {
  font-size: 14px;
  opacity: 0.7;
}
.progress-total {
  font-size: 14px;
  opacity: 0.7;
}

/* 对话区域 */
.chat-area {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.chat-message {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}
.ai-message {
  padding-right: 40px;
}
.user-message {
  flex-direction: row-reverse;
  padding-left: 40px;
}
.message-avatar {
  flex-shrink: 0;
  margin-top: 2px;
}
.message-bubble {
  max-width: 100%;
  padding: 14px 18px;
  border-radius: 16px;
  line-height: 1.7;
  font-size: 14px;
  position: relative;
}
.ai-bubble {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-top-left-radius: 4px;
  color: var(--text-primary);
}
.ai-bubble p {
  margin-bottom: 8px;
}
.ai-bubble p:last-child {
  margin-bottom: 0;
}
.user-bubble {
  background: linear-gradient(135deg, #2563EB, #3B82F6);
  color: white;
  border-top-right-radius: 4px;
}
.intro-message {
  margin-bottom: 8px;
}
.intro-hint {
  font-weight: 600;
  color: var(--accent);
}

/* 打字指示器 */
.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 4px 0;
}
.typing-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--text-muted);
  animation: typingBounce 1.4s infinite;
}
.typing-dot:nth-child(2) {
  animation-delay: 0.2s;
}
.typing-dot:nth-child(3) {
  animation-delay: 0.4s;
}
@keyframes typingBounce {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  30% {
    transform: translateY(-8px);
    opacity: 1;
  }
}

/* 输入区域 */
.input-area {
  flex-shrink: 0;
  padding-top: 12px;
  border-top: 1px solid var(--border);
}
.input-wrapper {
  background: var(--bg-card);
  border-radius: var(--radius);
  border: 1px solid var(--border);
  padding: 12px;
  transition: border-color 0.2s;
}
.input-wrapper:focus-within {
  border-color: var(--primary);
}
.chat-input :deep(.el-textarea__inner) {
  border: none;
  box-shadow: none;
  background: transparent;
  font-size: 14px;
  padding: 4px 0;
}
.input-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 8px;
}
.input-hint {
  font-size: 12px;
  color: var(--text-muted);
}

/* 完成操作 */
.complete-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  padding: 24px 0;
  flex-shrink: 0;
  border-top: 1px solid var(--border);
}
.restart-btn {
  border: 2px solid var(--border);
}

/* 退出弹窗 */
.exit-dialog-body {
  text-align: center;
  color: var(--text-secondary);
  line-height: 1.6;
}
.exit-dialog-answered {
  margin-top: 8px;
  font-weight: 600;
  color: var(--primary);
}

/* 滚动条美化 */
.chat-area::-webkit-scrollbar {
  width: 4px;
}
.chat-area::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 2px;
}

/* Responsive */
@media (max-width: 768px) {
  .interview-test {
    height: calc(100vh - 200px);
  }
  .ai-message {
    padding-right: 20px;
  }
  .user-message {
    padding-left: 20px;
  }
  .message-bubble {
    padding: 12px 14px;
    font-size: 13px;
  }
  .interview-title {
    font-size: 18px;
  }
  .complete-actions {
    flex-direction: column;
    align-items: center;
  }
}
@media (max-width: 480px) {
  .ai-message {
    padding-right: 0;
  }
  .user-message {
    padding-left: 0;
  }
  .interview-title {
    font-size: 16px;
  }
}
</style>