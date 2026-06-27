<template>
  <AppLayout>
    <div class="chat-page">
      <!-- 左侧会话列表 -->
      <aside class="chat-sidebar" :class="{ 'sidebar-open': sidebarOpen }">
        <div class="sidebar-header">
          <h3>对话记录</h3>
          <el-button
            type="primary"
            :icon="Plus"
            size="small"
            round
            @click="handleNewChat"
          >
            新对话
          </el-button>
        </div>
        <div class="session-list">
          <div
            v-for="session in chatStore.sessions"
            :key="session.id"
            class="session-item"
            :class="{ active: session.id === chatStore.currentSessionId }"
            @click="chatStore.switchSession(session.id)"
          >
            <div class="session-icon">
              <el-icon :size="16"><ChatDotRound /></el-icon>
            </div>
            <div class="session-info">
              <span class="session-title">{{ session.title }}</span>
              <span class="session-date">{{ session.date }}</span>
            </div>
          </div>
        </div>
      </aside>

      <!-- 移动端遮罩 -->
      <transition name="fade">
        <div v-if="sidebarOpen" class="sidebar-overlay" @click="sidebarOpen = false" />
      </transition>

      <!-- 主聊天区 -->
      <div class="chat-main">
        <!-- 移动端侧边栏切换 -->
        <div class="chat-topbar">
          <el-button
            :icon="Expand"
            circle
            size="small"
            class="sidebar-toggle"
            @click="sidebarOpen = !sidebarOpen"
          />
          <span class="current-session-title">
            {{ currentSessionTitle }}
          </span>
          <el-button
            :icon="Plus"
            circle
            size="small"
            class="new-chat-mobile"
            @click="handleNewChat"
          />
        </div>

        <!-- 快捷操作标签 -->
        <div class="quick-actions">
          <el-button
            v-for="action in quickActions"
            :key="action.label"
            :type="action.type"
            size="small"
            round
            plain
            @click="handleQuickAction(action.label)"
          >
            {{ action.label }}
          </el-button>
        </div>

        <!-- 消息列表 -->
        <div class="messages-container" ref="messagesContainer">
          <div v-if="currentMessages.length === 0" class="empty-chat">
            <div class="empty-icon">
              <el-icon :size="48" color="#2563EB"><ChatDotRound /></el-icon>
            </div>
            <h3>你好，我是优伴AI成长助手</h3>
            <p>我可以帮你解读优势报告、拆解成长目标、分析成长瓶颈，也可以在你迷茫时陪你聊聊。开始对话吧！</p>
          </div>

          <div
            v-for="(msg, index) in currentMessages"
            :key="index"
            class="message-row"
            :class="msg.role"
          >
            <!-- AI 头像 -->
            <div v-if="msg.role === 'assistant'" class="msg-avatar">
              <el-avatar :size="36" :icon="Cpu" class="ai-avatar" />
            </div>

            <!-- 消息气泡 -->
            <div class="msg-bubble" :class="msg.role">
              <div
                v-if="msg.role === 'assistant'"
                class="msg-content markdown-body"
                v-html="renderMarkdown(msg.content)"
              />
              <div v-else class="msg-content">
                {{ msg.content }}
              </div>
              <span class="msg-time">{{ msg.time }}</span>
            </div>

            <!-- 用户头像 -->
            <div v-if="msg.role === 'user'" class="msg-avatar">
              <el-avatar :size="36" icon="UserFilled" />
            </div>
          </div>

          <!-- 加载动画 -->
          <div v-if="isThinking" class="message-row assistant">
            <div class="msg-avatar">
              <el-avatar :size="36" :icon="Cpu" class="ai-avatar" />
            </div>
            <div class="msg-bubble assistant thinking-bubble">
              <div class="typing-indicator">
                <span class="typing-dot" />
                <span class="typing-dot" />
                <span class="typing-dot" />
              </div>
            </div>
          </div>
        </div>

        <!-- 输入区域 -->
        <div class="input-area">
          <div class="input-wrapper">
            <el-input
              v-model="inputText"
              placeholder="输入你的问题，Enter 发送..."
              size="large"
              :rows="1"
              maxlength="500"
              show-word-limit
              @keyup.enter.exact="handleSend"
              :disabled="isThinking"
            >
              <template #suffix>
                <el-button
                  type="primary"
                  :icon="Promotion"
                  circle
                  size="small"
                  @click="handleSend"
                  :disabled="!inputText.trim() || isThinking"
                  class="send-btn"
                />
              </template>
            </el-input>
          </div>
          <p class="input-hint">AI 助手提供建议仅供参考，重要决策请结合实际情况判断</p>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useChatStore } from '@/stores/chat'
import { marked } from 'marked'
import AppLayout from '@/components/layout/AppLayout.vue'
import { ElMessage } from 'element-plus'

const chatStore = useChatStore()
const messagesContainer = ref(null)
const inputText = ref('')
const isThinking = ref(false)
const sidebarOpen = ref(false)

// 配置 marked
marked.setOptions({
  breaks: true,
  gfm: true,
})

const quickActions = [
  { label: '优势解读', type: 'primary' },
  { label: '目标拆解', type: 'success' },
  { label: '情绪疏导', type: 'warning' },
  { label: '知识科普', type: 'info' },
]

const currentMessages = computed(() => {
  const session = chatStore.currentSession()
  return session?.messages || []
})

const currentSessionTitle = computed(() => {
  const session = chatStore.currentSession()
  return session?.title || 'AI 成长助手'
})

function renderMarkdown(text) {
  if (!text) return ''
  return marked.parse(text)
}

function handleSend() {
  const text = inputText.value.trim()
  if (!text || isThinking.value) return
  inputText.value = ''
  chatStore.sendMessage(text)
  // 更新会话标题
  const session = chatStore.currentSession()
  if (session && session.title === '新对话' && session.messages.length >= 2) {
    session.title = text.length > 15 ? text.slice(0, 15) + '...' : text
  }
  isThinking.value = true
  setTimeout(() => {
    isThinking.value = false
    scrollToBottom()
  }, 1500)
  scrollToBottom()
}

function handleNewChat() {
  chatStore.newSession()
  sidebarOpen.value = false
  scrollToBottom()
}

function handleQuickAction(label) {
  const prompts = {
    '优势解读': '我想了解一下我的优势测评结果，能帮我解读一下吗？',
    '目标拆解': '我有一个成长目标，但不知道如何把它拆解成可执行的步骤，能帮帮我吗？',
    '情绪疏导': '最近感觉有些焦虑和迷茫，能陪我聊聊吗？',
    '知识科普': '能给我分享一些关于个人成长和优势发展的知识吗？',
  }
  const prompt = prompts[label]
  if (prompt) {
    inputText.value = prompt
    handleSend()
  }
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

// 监听消息变化自动滚动
watch(currentMessages, () => {
  scrollToBottom()
}, { deep: true })

// 关闭侧边栏当窗口变大
watch(sidebarOpen, (val) => {
  if (val) {
    const handler = () => {
      if (window.innerWidth > 768) {
        sidebarOpen.value = false
      }
    }
    window.addEventListener('resize', handler, { once: true })
  }
})
</script>

<style scoped>
.chat-page {
  display: flex;
  height: calc(100vh - 140px);
  max-height: calc(100vh - 140px);
  overflow: hidden;
  margin: -24px;
}

/* 侧边栏 */
.chat-sidebar {
  width: 280px;
  background: var(--bg-card);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}
.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 16px;
  border-bottom: 1px solid var(--border);
}
.sidebar-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}
.session-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}
.session-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: var(--transition);
  margin-bottom: 2px;
}
.session-item:hover {
  background: rgba(37, 99, 235, 0.06);
}
.session-item.active {
  background: rgba(37, 99, 235, 0.1);
  color: var(--primary);
}
.session-icon {
  color: var(--text-muted);
  flex-shrink: 0;
}
.session-item.active .session-icon {
  color: var(--primary);
}
.session-info {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.session-title {
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.session-date {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 2px;
}

/* 移动端遮罩 */
.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 90;
}

/* 主聊天区 */
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: var(--bg-primary);
}

/* 顶部栏（移动端） */
.chat-topbar {
  display: none;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  background: var(--bg-card);
  border-bottom: 1px solid var(--border);
}
.current-session-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 快捷操作 */
.quick-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 14px 20px;
  background: var(--bg-card);
  border-bottom: 1px solid var(--border);
}

/* 消息容器 */
.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 空状态 */
.empty-chat {
  text-align: center;
  padding: 60px 20px;
  margin: auto;
}
.empty-icon {
  margin-bottom: 16px;
}
.empty-chat h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 8px;
}
.empty-chat p {
  font-size: 14px;
  color: var(--text-secondary);
  max-width: 400px;
  margin: 0 auto;
  line-height: 1.6;
}

/* 消息行 */
.message-row {
  display: flex;
  gap: 10px;
  max-width: 80%;
}
.message-row.user {
  align-self: flex-end;
  flex-direction: row-reverse;
}
.message-row.assistant {
  align-self: flex-start;
}
.msg-avatar {
  flex-shrink: 0;
}
.ai-avatar {
  background: linear-gradient(135deg, #2563EB, #3B82F6) !important;
}

/* 消息气泡 */
.msg-bubble {
  padding: 12px 16px;
  border-radius: 16px;
  position: relative;
  max-width: 100%;
}
.msg-bubble.user {
  background: var(--primary);
  color: #fff;
  border-bottom-right-radius: 4px;
}
.msg-bubble.assistant {
  background: var(--bg-card);
  color: var(--text-primary);
  border: 1px solid var(--border);
  border-bottom-left-radius: 4px;
}
.msg-content {
  font-size: 14px;
  line-height: 1.7;
  word-break: break-word;
}
.msg-bubble.user .msg-time {
  color: rgba(255, 255, 255, 0.7);
}
.msg-time {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 6px;
  display: block;
  text-align: right;
}

/* Markdown 样式 */
.markdown-body :deep(h1),
.markdown-body :deep(h2),
.markdown-body :deep(h3) {
  font-size: 15px;
  font-weight: 600;
  margin: 8px 0 4px;
  color: var(--text-primary);
}
.markdown-body :deep(p) {
  margin: 0 0 6px;
}
.markdown-body :deep(ul),
.markdown-body :deep(ol) {
  padding-left: 18px;
  margin: 4px 0 8px;
}
.markdown-body :deep(li) {
  margin-bottom: 2px;
}
.markdown-body :deep(strong) {
  color: var(--primary);
}
.markdown-body :deep(code) {
  background: rgba(37, 99, 235, 0.08);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 13px;
}

/* 打字动画 */
.thinking-bubble {
  padding: 16px 20px;
}
.typing-indicator {
  display: flex;
  gap: 5px;
  align-items: center;
}
.typing-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--text-muted);
  animation: typing-bounce 1.4s infinite ease-in-out both;
}
.typing-dot:nth-child(1) { animation-delay: -0.32s; }
.typing-dot:nth-child(2) { animation-delay: -0.16s; }
.typing-dot:nth-child(3) { animation-delay: 0s; }

@keyframes typing-bounce {
  0%, 80%, 100% {
    transform: scale(0.6);
    opacity: 0.4;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

/* 输入区域 */
.input-area {
  padding: 14px 20px 18px;
  background: var(--bg-card);
  border-top: 1px solid var(--border);
}
.input-wrapper {
  max-width: 800px;
  margin: 0 auto;
}
.send-btn {
  margin-left: 4px;
}
.input-hint {
  text-align: center;
  font-size: 11px;
  color: var(--text-muted);
  margin: 8px 0 0;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 响应式 */
@media (max-width: 768px) {
  .chat-page {
    margin: -16px;
    height: calc(100vh - 112px);
    max-height: calc(100vh - 112px);
  }
  .chat-sidebar {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    z-index: 100;
    width: 280px;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    box-shadow: var(--shadow-md);
  }
  .chat-sidebar.sidebar-open {
    transform: translateX(0);
  }
  .chat-topbar {
    display: flex;
  }
  .quick-actions {
    padding: 10px 14px;
    gap: 6px;
  }
  .messages-container {
    padding: 14px 16px;
    gap: 12px;
  }
  .message-row {
    max-width: 90%;
  }
  .input-area {
    padding: 10px 14px 14px;
  }
}
</style>