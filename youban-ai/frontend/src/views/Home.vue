<template>
  <div class="home-page">
    <!-- 顶部导航 -->
    <header class="home-header" :class="{ scrolled: isScrolled }">
      <div class="header-inner">
        <div class="logo-section">
          <span class="logo-icon">✨</span>
          <span class="logo-text">优伴AI</span>
        </div>
        <nav class="header-nav">
          <a href="#features" class="nav-link">核心功能</a>
          <a href="#how-it-works" class="nav-link">使用流程</a>
          <a href="#stats" class="nav-link">用户口碑</a>
        </nav>
        <div class="header-actions">
          <el-button
            v-if="!userStore.isLoggedIn"
            text
            size="large"
            class="login-btn"
            @click="router.push('/auth')"
          >
            登录
          </el-button>
          <el-button
            v-if="!userStore.isLoggedIn"
            type="primary"
            size="large"
            round
            class="signup-btn"
            @click="router.push('/auth?tab=register')"
          >
            免费注册
          </el-button>
          <router-link v-else to="/home" class="dashboard-link">
            <el-button type="primary" size="large" round>
              进入用户中心
            </el-button>
          </router-link>
          <el-button
            v-if="userStore.isLoggedIn"
            text
            size="large"
            class="logout-btn"
            @click="handleLogout"
          >
            退出登录
          </el-button>
        </div>
      </div>
    </header>

    <!-- 英雄区域 -->
    <section class="hero-section">
      <div class="hero-bg-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
      </div>
      <div class="hero-content">
        <div class="hero-badge">
          <el-tag type="warning" effect="dark" round size="large">AI 驱动的个人成长平台</el-tag>
        </div>
        <h1 class="hero-title">
          发现天赋优势<span class="highlight">，</span><br class="mobile-break" />精准高效成长
        </h1>
        <p class="hero-desc">
          基于 AI 深度测评，精准识别你的天赋优势、能力短板与成长方向，
          为你量身打造专属成长路径，让每一步成长都有迹可循。
        </p>
        <div class="hero-actions">
          <el-button
            type="primary"
            size="large"
            round
            class="cta-btn"
            @click="$router.push('/assessment')"
          >
            <el-icon><EditPen /></el-icon>
            开始免费测评
          </el-button>
          <el-button
            size="large"
            round
            class="cta-secondary"
            @click="$router.push('/assistant')"
          >
            <el-icon><ChatDotRound /></el-icon>
            体验 AI 助手
          </el-button>
        </div>
        <div class="hero-stats-row">
          <div class="hero-stat">
            <span class="stat-number">50,000+</span>
            <span class="stat-label">用户信任</span>
          </div>
          <div class="hero-stat">
            <span class="stat-number">95%</span>
            <span class="stat-label">满意度</span>
          </div>
          <div class="hero-stat">
            <span class="stat-number">4.8</span>
            <span class="stat-label">用户评分</span>
          </div>
        </div>
      </div>
      <div class="hero-visual">
        <div class="hero-card-float card-1">
          <div class="mini-chart">
            <div class="mini-bar" style="height:70%"></div>
            <div class="mini-bar" style="height:85%"></div>
            <div class="mini-bar" style="height:60%"></div>
            <div class="mini-bar" style="height:90%"></div>
          </div>
          <span class="mini-label">天赋分数</span>
        </div>
        <div class="hero-card-float card-2">
          <div class="check-list">
            <div class="check-item done">✓ 优势测评</div>
            <div class="check-item done">✓ 成长规划</div>
            <div class="check-item">○ 实践落地</div>
          </div>
        </div>
        <div class="hero-card-float card-3">
          <el-icon :size="32" class="star-icon"><StarFilled /></el-icon>
          <span class="level-text">LV.12</span>
        </div>
      </div>
    </section>

    <!-- 核心功能 -->
    <section id="features" class="features-section">
      <div class="section-container">
        <div class="section-header">
          <h2 class="section-title">四大核心功能，全方位助力成长</h2>
          <p class="section-subtitle">从认知到行动，构建完整的个人成长闭环</p>
        </div>
        <div class="features-grid">
          <div class="feature-card" v-for="feature in features" :key="feature.title">
            <div class="feature-icon" :style="{ background: feature.bg }">
              <el-icon :size="28">
                <component :is="feature.icon" />
              </el-icon>
            </div>
            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-desc">{{ feature.desc }}</p>
            <ul class="feature-points">
              <li v-for="point in feature.points" :key="point">{{ point }}</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- 使用流程 -->
    <section id="how-it-works" class="how-section">
      <div class="section-container">
        <div class="section-header">
          <h2 class="section-title">三步开启你的成长之旅</h2>
          <p class="section-subtitle">简单高效，科学系统</p>
        </div>
        <div class="steps-wrapper">
          <div class="step-line"></div>
          <div class="step-card" v-for="(step, idx) in steps" :key="idx">
            <div class="step-number">{{ idx + 1 }}</div>
            <div class="step-icon-wrap">
              <el-icon :size="40">
                <component :is="step.icon" />
              </el-icon>
            </div>
            <h3 class="step-title">{{ step.title }}</h3>
            <p class="step-desc">{{ step.desc }}</p>
            <div class="step-meta">
              <el-tag size="small" effect="plain" round>{{ step.tag }}</el-tag>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 用户口碑 / 数据 -->
    <section id="stats" class="stats-section">
      <div class="section-container">
        <div class="section-header">
          <h2 class="section-title">被数万用户信赖的成长伙伴</h2>
          <p class="section-subtitle">用数据说话，用效果证明</p>
        </div>
        <div class="testimonials-grid">
          <div class="testimonial-card" v-for="t in testimonials" :key="t.name">
            <div class="testimonial-quote">"</div>
            <p class="testimonial-text">{{ t.text }}</p>
            <div class="testimonial-author">
              <el-avatar :size="40" :style="{ background: t.color }">
                {{ t.name[0] }}
              </el-avatar>
              <div class="author-info">
                <span class="author-name">{{ t.name }}</span>
                <span class="author-role">{{ t.role }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 底部 -->
    <footer class="home-footer">
      <div class="footer-inner">
        <div class="footer-brand">
          <span class="logo-icon">✨</span>
          <span class="logo-text">优伴AI</span>
          <p class="footer-slogan">发现天赋优势，精准高效成长</p>
        </div>
        <div class="footer-links">
          <div class="footer-col">
            <h4>产品</h4>
            <a href="#features">核心功能</a>
            <a href="#how-it-works">使用流程</a>
            <router-link to="/assessment">优势测评</router-link>
            <router-link to="/practice">实践库</router-link>
          </div>
          <div class="footer-col">
            <h4>支持</h4>
            <a href="#">帮助中心</a>
            <a href="#">常见问题</a>
            <a href="#">用户协议</a>
            <a href="#">隐私政策</a>
          </div>
          <div class="footer-col">
            <h4>关于</h4>
            <a href="#">关于我们</a>
            <a href="#">联系我们</a>
            <a href="#">加入我们</a>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2026 优伴AI. All rights reserved.</p>
      </div>
    </footer>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()

const isScrolled = ref(false)

function onScroll() {
  isScrolled.value = window.scrollY > 60
}

onMounted(() => {
  window.addEventListener('scroll', onScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})

function handleLogout() {
  userStore.logout()
  ElMessage.success('已退出登录')
}

const features = [
  {
    icon: 'EditPen',
    title: '优势测评',
    desc: 'AI 多维度深度测评，精准定位你的天赋优势与潜在能力',
    points: ['快速版 / 完整版 / 访谈版', '4 大维度全面分析', '生成专属优势报告'],
    bg: 'linear-gradient(135deg, #2563EB, #3B82F6)',
  },
  {
    icon: 'TrendCharts',
    title: '成长规划',
    desc: '基于测评结果，AI 为你量身定制科学系统的成长路径',
    points: ['智能目标拆解', '阶段化里程碑', '可视化成长轨迹'],
    bg: 'linear-gradient(135deg, #7C3AED, #8B5CF6)',
  },
  {
    icon: 'ChatDotRound',
    title: 'AI 陪伴',
    desc: '随时随地的 AI 成长助手，为你答疑解惑，陪伴每一步成长',
    points: ['7×24 智能对话', '个性化建议', '情感支持与鼓励'],
    bg: 'linear-gradient(135deg, #059669, #10B981)',
  },
  {
    icon: 'Collection',
    title: '实践落地',
    desc: '丰富的实践项目库，将认知转化为行动，让成长真正发生',
    points: ['场景化练习任务', '进度追踪打卡', '社区互动反馈'],
    bg: 'linear-gradient(135deg, #F97316, #FB923C)',
  },
]

const steps = [
  {
    icon: 'EditPen',
    title: '完成测评',
    desc: '选择适合你的测评方式，花 5-15 分钟回答科学设计的问题，AI 会深度分析你的回答',
    tag: '约 5-15 分钟',
  },
  {
    icon: 'TrendCharts',
    title: '生成规划',
    desc: 'AI 根据你的测评结果，自动生成个性化成长路径，包含目标设定、阶段计划与行动建议',
    tag: 'AI 智能生成',
  },
  {
    icon: 'StarFilled',
    title: '开始成长',
    desc: '跟随规划执行实践任务，AI 助手实时陪伴，追踪进度，调整策略，让成长有迹可循',
    tag: '持续迭代',
  },
]

const testimonials = [
  {
    name: '李明',
    role: '互联网产品经理',
    text: '优伴AI帮我清晰地认识到了自己的优势领域，测评报告非常精准，让我在职业规划上有了明确方向。',
    color: '#2563EB',
  },
  {
    name: '王芳',
    role: '自由职业者',
    text: 'AI 助手真的很贴心，每天都会给我鼓励和建议，三个月下来，我的时间管理能力提升了很多。',
    color: '#7C3AED',
  },
  {
    name: '张伟',
    role: '大学生',
    text: '作为一个即将毕业的学生，优伴AI帮我找到了自己的天赋所在，让我对未来不再迷茫。',
    color: '#F97316',
  },
]
</script>

<style scoped>
.home-page {
  background: var(--bg-primary);
  overflow-x: hidden;
}

/* Header */
.home-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 200;
  padding: 0 24px;
  height: 64px;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
  background: transparent;
}
.home-header.scrolled {
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(12px);
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.06);
  border-bottom: 1px solid var(--border);
}
:root.dark .home-header.scrolled {
  background: rgba(15, 23, 42, 0.92);
}
.header-inner {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.logo-section {
  display: flex;
  align-items: center;
  gap: 8px;
}
.logo-icon {
  font-size: 26px;
}
.logo-text {
  font-size: 20px;
  font-weight: 700;
  color: var(--primary);
}
.header-nav {
  display: flex;
  gap: 32px;
}
.nav-link {
  font-size: 14px;
  color: var(--text-secondary);
  text-decoration: none;
  transition: color 0.2s;
  font-weight: 500;
}
.nav-link:hover {
  color: var(--primary);
}
.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}
.login-btn {
  color: var(--text-secondary);
}
.signup-btn {
  background: var(--primary);
  border-color: var(--primary);
}
.dashboard-link {
  text-decoration: none;
}

/* Hero */
.hero-section {
  position: relative;
  padding: 140px 24px 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 80px;
  min-height: 100vh;
  overflow: hidden;
  background: linear-gradient(135deg, #EFF6FF 0%, #FFF7ED 50%, #F0FDF4 100%);
}
:root.dark .hero-section {
  background: linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%);
}
.hero-bg-shapes {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.shape {
  position: absolute;
  border-radius: 50%;
  opacity: 0.15;
}
.shape-1 {
  width: 400px;
  height: 400px;
  background: var(--primary);
  top: -100px;
  right: -100px;
  animation: float 8s ease-in-out infinite;
}
.shape-2 {
  width: 300px;
  height: 300px;
  background: var(--accent);
  bottom: -50px;
  left: -50px;
  animation: float 10s ease-in-out infinite reverse;
}
.shape-3 {
  width: 200px;
  height: 200px;
  background: #7C3AED;
  top: 50%;
  left: 40%;
  animation: float 12s ease-in-out infinite 2s;
}
@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-30px) rotate(5deg); }
}
.hero-content {
  max-width: 560px;
  z-index: 1;
}
.hero-badge {
  margin-bottom: 20px;
}
.hero-title {
  font-size: 48px;
  font-weight: 800;
  line-height: 1.25;
  color: var(--text-primary);
  margin-bottom: 20px;
  letter-spacing: -0.02em;
}
.hero-title .highlight {
  color: var(--primary);
}
.hero-desc {
  font-size: 17px;
  line-height: 1.7;
  color: var(--text-secondary);
  margin-bottom: 36px;
}
.hero-actions {
  display: flex;
  gap: 16px;
  margin-bottom: 40px;
}
.cta-btn {
  padding: 14px 32px;
  font-size: 16px;
  font-weight: 600;
  background: var(--primary);
  border-color: var(--primary);
  box-shadow: 0 8px 24px rgba(37, 99, 235, 0.3);
}
.cta-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(37, 99, 235, 0.4);
}
.cta-secondary {
  padding: 14px 32px;
  font-size: 16px;
  font-weight: 600;
  border: 2px solid var(--border);
  color: var(--text-primary);
}
.cta-secondary:hover {
  border-color: var(--primary);
  color: var(--primary);
}
.hero-stats-row {
  display: flex;
  gap: 48px;
}
.hero-stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.stat-number {
  font-size: 28px;
  font-weight: 700;
  color: var(--primary);
}
.stat-label {
  font-size: 13px;
  color: var(--text-muted);
}

.hero-visual {
  position: relative;
  width: 420px;
  height: 420px;
  z-index: 1;
  display: none;
}
.hero-card-float {
  position: absolute;
  background: var(--bg-card);
  border-radius: var(--radius);
  box-shadow: var(--shadow-md);
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  animation: floatCard 6s ease-in-out infinite;
}
.card-1 {
  top: 20px;
  left: 40px;
  animation-delay: 0s;
}
.card-2 {
  top: 140px;
  right: 20px;
  animation-delay: 1.5s;
}
.card-3 {
  bottom: 80px;
  left: 60px;
  animation-delay: 3s;
}
@keyframes floatCard {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}
.mini-chart {
  display: flex;
  align-items: flex-end;
  gap: 6px;
  height: 48px;
}
.mini-bar {
  width: 10px;
  background: var(--primary);
  border-radius: 4px 4px 0 0;
  opacity: 0.7;
}
.mini-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}
.check-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.check-item {
  font-size: 13px;
  color: var(--text-secondary);
}
.check-item.done {
  color: var(--success);
  font-weight: 500;
}
.star-icon {
  color: #F59E0B;
}
.level-text {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
}

/* Sections */
.section-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 80px 24px;
}
.section-header {
  text-align: center;
  margin-bottom: 56px;
}
.section-title {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 12px;
}
.section-subtitle {
  font-size: 16px;
  color: var(--text-secondary);
}

/* Features */
.features-section {
  background: var(--bg-card);
}
.features-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}
.feature-card {
  padding: 32px 24px;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  background: var(--bg-primary);
  transition: all 0.3s ease;
  text-align: center;
}
.feature-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08);
  border-color: var(--primary);
}
.feature-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  color: white;
}
.feature-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 10px;
  color: var(--text-primary);
}
.feature-desc {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 16px;
}
.feature-points {
  list-style: none;
  text-align: left;
  padding: 0;
}
.feature-points li {
  font-size: 13px;
  color: var(--text-muted);
  padding: 4px 0;
  padding-left: 16px;
  position: relative;
}
.feature-points li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: var(--primary);
  font-weight: bold;
}

/* How it works */
.how-section {
  background: var(--bg-primary);
}
.steps-wrapper {
  display: flex;
  justify-content: center;
  gap: 40px;
  position: relative;
}
.step-line {
  position: absolute;
  top: 40px;
  left: 17%;
  right: 17%;
  height: 2px;
  background: linear-gradient(90deg, var(--primary), var(--accent));
  opacity: 0.3;
}
.step-card {
  flex: 1;
  max-width: 320px;
  text-align: center;
  position: relative;
  z-index: 1;
  background: var(--bg-card);
  border-radius: var(--radius);
  padding: 40px 28px;
  border: 1px solid var(--border);
  transition: all 0.3s ease;
}
.step-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}
.step-number {
  width: 40px;
  height: 40px;
  background: var(--primary);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
  margin: 0 auto 20px;
}
.step-icon-wrap {
  color: var(--primary);
  margin-bottom: 16px;
}
.step-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 12px;
  color: var(--text-primary);
}
.step-desc {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.7;
  margin-bottom: 16px;
}
.step-meta {
  display: inline-block;
}

/* Stats / Testimonials */
.stats-section {
  background: var(--bg-card);
}
.testimonials-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}
.testimonial-card {
  background: var(--bg-primary);
  border-radius: var(--radius);
  padding: 32px 28px;
  border: 1px solid var(--border);
  position: relative;
  transition: all 0.3s ease;
}
.testimonial-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}
.testimonial-quote {
  font-size: 48px;
  font-weight: 800;
  color: var(--primary);
  opacity: 0.2;
  line-height: 1;
  margin-bottom: -8px;
}
.testimonial-text {
  font-size: 14px;
  line-height: 1.8;
  color: var(--text-secondary);
  margin-bottom: 20px;
}
.testimonial-author {
  display: flex;
  align-items: center;
  gap: 12px;
}
.author-info {
  display: flex;
  flex-direction: column;
}
.author-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}
.author-role {
  font-size: 12px;
  color: var(--text-muted);
}

/* Footer */
.home-footer {
  background: #1E293B;
  color: #CBD5E1;
  padding: 60px 24px 24px;
}
:root.dark .home-footer {
  background: #0F172A;
}
.footer-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  gap: 60px;
  padding-bottom: 40px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.footer-brand .logo-icon {
  font-size: 24px;
}
.footer-brand .logo-text {
  color: white;
  font-size: 20px;
}
.footer-slogan {
  margin-top: 8px;
  font-size: 13px;
  color: #94A3B8;
}
.footer-links {
  display: flex;
  gap: 80px;
}
.footer-col h4 {
  color: white;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 16px;
}
.footer-col a {
  display: block;
  color: #94A3B8;
  font-size: 13px;
  text-decoration: none;
  padding: 4px 0;
  transition: color 0.2s;
}
.footer-col a:hover {
  color: white;
}
.footer-bottom {
  max-width: 1200px;
  margin: 0 auto;
  padding-top: 24px;
  text-align: center;
  font-size: 13px;
  color: #64748B;
}

/* Responsive */
@media (min-width: 1024px) {
  .hero-visual {
    display: block;
  }
}
@media (max-width: 1024px) {
  .hero-section {
    flex-direction: column;
    text-align: center;
    padding: 120px 24px 60px;
  }
  .hero-actions {
    justify-content: center;
  }
  .hero-stats-row {
    justify-content: center;
  }
  .features-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .testimonials-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .footer-inner {
    flex-direction: column;
    gap: 40px;
  }
  .footer-links {
    gap: 40px;
  }
}
@media (max-width: 768px) {
  .home-header {
    padding: 0 16px;
    height: 56px;
  }
  .header-nav {
    display: none;
  }
  .hero-title {
    font-size: 32px;
  }
  .hero-desc {
    font-size: 15px;
  }
  .hero-actions {
    flex-direction: column;
    align-items: center;
  }
  .hero-stats-row {
    gap: 32px;
  }
  .features-grid {
    grid-template-columns: 1fr;
  }
  .steps-wrapper {
    flex-direction: column;
    align-items: center;
    gap: 24px;
  }
  .step-line {
    display: none;
  }
  .step-card {
    max-width: 100%;
  }
  .testimonials-grid {
    grid-template-columns: 1fr;
  }
  .section-container {
    padding: 60px 16px;
  }
  .section-title {
    font-size: 26px;
  }
  .footer-links {
    flex-direction: column;
    gap: 32px;
  }
  .mobile-break {
    display: none;
  }
}
@media (max-width: 480px) {
  .hero-stats-row {
    gap: 24px;
  }
  .stat-number {
    font-size: 22px;
  }
}
</style>