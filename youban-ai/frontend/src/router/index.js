import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  // 登录/注册
  {
    path: '/auth',
    name: 'Auth',
    component: () => import('@/views/Auth.vue'),
    meta: { title: '登录 - 优伴AI', noLayout: true, guest: true },
  },
  // 首页（未登录时展示落地页）
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { title: '优伴AI - 发现天赋优势', noLayout: true },
  },
  // 用户中心主页（登录后默认首页）
  {
    path: '/home',
    name: 'UserCenter',
    component: () => import('@/views/UserCenter.vue'),
    meta: { title: '用户中心' },
  },
  // 测评
  {
    path: '/assessment',
    name: 'Assessment',
    component: () => import('@/views/Assessment/Index.vue'),
    meta: { title: '优势测评' },
  },
  {
    path: '/assessment/quick',
    name: 'QuickTest',
    component: () => import('@/views/Assessment/QuickTest.vue'),
    meta: { title: '快速精简版测评' },
  },
  {
    path: '/assessment/full',
    name: 'FullTest',
    component: () => import('@/views/Assessment/FullTest.vue'),
    meta: { title: '专业完整版测评' },
  },
  {
    path: '/assessment/interview',
    name: 'InterviewTest',
    component: () => import('@/views/Assessment/InterviewTest.vue'),
    meta: { title: '深度访谈版测评' },
  },
  {
    path: '/assessment/report/:id',
    name: 'AssessmentReport',
    component: () => import('@/views/Assessment/Report.vue'),
    meta: { title: '优势测评报告' },
  },
  // 成长路径
  {
    path: '/growth',
    name: 'GrowthDashboard',
    component: () => import('@/views/Growth/Dashboard.vue'),
    meta: { title: '成长总看板' },
  },
  {
    path: '/growth/goal/create',
    name: 'GoalCreate',
    component: () => import('@/views/Growth/GoalCreate.vue'),
    meta: { title: '创建成长目标' },
  },
  {
    path: '/growth/goal/:id',
    name: 'GoalDetail',
    component: () => import('@/views/Growth/GoalDetail.vue'),
    meta: { title: '目标详情' },
  },
  // AI 助手
  {
    path: '/assistant',
    name: 'Assistant',
    component: () => import('@/views/Assistant/Chat.vue'),
    meta: { title: 'AI 成长助手' },
  },
  // 实践库
  {
    path: '/practice',
    name: 'Practice',
    component: () => import('@/views/Practice/Index.vue'),
    meta: { title: '优势落地实践库' },
  },
  {
    path: '/practice/:id',
    name: 'PracticeDetail',
    component: () => import('@/views/Practice/Detail.vue'),
    meta: { title: '实践项目详情' },
  },
  // 刻意练习模块
  {
    path: '/deliberate-practice',
    name: 'DeliberatePractice',
    component: () => import('@/views/Practice/DeliberatePractice.vue'),
    meta: { title: '刻意练习' },
  },
  {
    path: '/deliberate-practice/quality',
    name: 'PracticeQuality',
    component: () => import('@/views/Practice/PracticeQuality.vue'),
    meta: { title: '练习质量分析' },
  },
  {
    path: '/deliberate-practice/zone',
    name: 'ZoneAssessment',
    component: () => import('@/views/Practice/ZoneAssessment.vue'),
    meta: { title: '三区难度分析' },
  },
  {
    path: '/deliberate-practice/deep',
    name: 'DeepPractice',
    component: () => import('@/views/Practice/DeepPractice.vue'),
    meta: { title: '深度练习模式' },
  },
  // 个人中心
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/Profile/Index.vue'),
    meta: { title: '个人中心' },
  },
  {
    path: '/profile/archive',
    name: 'Archive',
    component: () => import('@/views/Profile/Archive.vue'),
    meta: { title: '成长档案' },
  },
  {
    path: '/profile/settings',
    name: 'Settings',
    component: () => import('@/views/Profile/Settings.vue'),
    meta: { title: '设置' },
  },
  // 认知偏差扫描仪
  {
    path: '/cognitive-bias',
    name: 'CognitiveBias',
    component: () => import('@/views/CognitiveBias/Index.vue'),
    meta: { title: '认知偏差扫描仪' },
  },
  {
    path: '/cognitive-bias/test',
    name: 'CognitiveBiasTest',
    component: () => import('@/views/CognitiveBias/Test.vue'),
    meta: { title: '认知偏差扫描' },
  },
  {
    path: '/cognitive-bias/result/:id',
    name: 'CognitiveBiasResult',
    component: () => import('@/views/CognitiveBias/Result.vue'),
    meta: { title: '扫描报告' },
  },
  // 双系统思维训练
  {
    path: '/dual-system',
    name: 'DualSystem',
    component: () => import('@/views/DualSystem/Index.vue'),
    meta: { title: '双系统思维训练' },
  },
  {
    path: '/dual-system/test',
    name: 'DualSystemTest',
    component: () => import('@/views/DualSystem/Test.vue'),
    meta: { title: '思维训练' },
  },
  {
    path: '/dual-system/result/:id',
    name: 'DualSystemResult',
    component: () => import('@/views/DualSystem/Result.vue'),
    meta: { title: '训练报告' },
  },
  // 过度自信校准
  {
    path: '/calibration',
    name: 'Calibration',
    component: () => import('@/views/Calibration/Index.vue'),
    meta: { title: '过度自信校准' },
  },
  {
    path: '/calibration/test',
    name: 'CalibrationTest',
    component: () => import('@/views/Calibration/Test.vue'),
    meta: { title: '校准测试' },
  },
  {
    path: '/calibration/result/:id',
    name: 'CalibrationResult',
    component: () => import('@/views/Calibration/Result.vue'),
    meta: { title: '校准报告' },
  },
  // 认知层次诊断
  {
    path: '/cognitive-level',
    name: 'CognitiveLevel',
    component: () => import('@/views/CognitiveLevel/Index.vue'),
    meta: { title: '认知层次诊断' },
  },
  {
    path: '/cognitive-level/test',
    name: 'CognitiveLevelTest',
    component: () => import('@/views/CognitiveLevel/Test.vue'),
    meta: { title: '认知诊断' },
  },
  {
    path: '/cognitive-level/result/:id',
    name: 'CognitiveLevelResult',
    component: () => import('@/views/CognitiveLevel/Result.vue'),
    meta: { title: '诊断报告' },
  },
  // 价值定位分析
  {
    path: '/cognitive-value',
    name: 'CognitiveValue',
    component: () => import('@/views/CognitiveValue/Index.vue'),
    meta: { title: '价值定位分析' },
  },
  {
    path: '/cognitive-value/leverage',
    name: 'LeverageAnalysis',
    component: () => import('@/views/CognitiveValue/Leverage.vue'),
    meta: { title: '杠杆点分析' },
  },
  {
    path: '/cognitive-value/compound-growth',
    name: 'CompoundGrowth',
    component: () => import('@/views/CognitiveValue/CompoundGrowth.vue'),
    meta: { title: '复利成长引擎' },
  },
  {
    path: '/cognitive-value/knowledge-network',
    name: 'KnowledgeNetwork',
    component: () => import('@/views/CognitiveValue/KnowledgeNetwork.vue'),
    meta: { title: '知识网络' },
  },
  // 决策辅助
  {
    path: '/decision-support',
    name: 'DecisionSupport',
    component: () => import('@/views/DecisionSupport/Index.vue'),
    meta: { title: '决策辅助系统' },
  },
  // 会员升级
  {
    path: '/upgrade',
    name: 'Upgrade',
    component: () => import('@/views/Upgrade.vue'),
    meta: { title: '升级会员' },
  },
  // 管理后台
  {
    path: '/admin',
    component: () => import('@/components/layout/AdminLayout.vue'),
    meta: { admin: true },
    children: [
      {
        path: '',
        name: 'AdminDashboard',
        component: () => import('@/views/Admin/Dashboard.vue'),
        meta: { title: '管理后台' },
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: () => import('@/views/Admin/Users.vue'),
        meta: { title: '用户管理' },
      },
      {
        path: 'accounts',
        name: 'AdminAccounts',
        component: () => import('@/views/Admin/Accounts.vue'),
        meta: { title: '管理员账号管理' },
      },
      {
        path: 'content',
        name: 'AdminContent',
        component: () => import('@/views/Admin/Content.vue'),
        meta: { title: '内容管理' },
      },
      {
        path: 'system',
        name: 'AdminSystem',
        component: () => import('@/views/Admin/System.vue'),
        meta: { title: '系统配置' },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title || '优伴AI'

  const token = localStorage.getItem('youban_token')
  const isAuthPage = to.meta.guest

  // Check if any parent route has admin meta (for nested routes)
  const requiresAdmin = to.matched.some(r => r.meta.admin)
  const requiresAuth = !to.meta.noLayout && !to.meta.guest

  if (requiresAuth && !token) {
    return next('/auth')
  }

  if (requiresAdmin && !token) {
    return next('/auth')
  }

  // Check admin permission
  if (requiresAdmin && token) {
    try {
      const savedUser = JSON.parse(localStorage.getItem('youban_user') || '{}')
      if (savedUser.memberLevel !== 'admin') {
        return next('/home')
      }
    } catch {
      return next('/home')
    }
  }

  // Logged-in users: redirect guest pages to user center
  if (token && isAuthPage) {
    return next('/home')
  }

  // Logged-in users visiting landing page: redirect to user center
  if (token && to.path === '/') {
    return next('/home')
  }

  next()
})

export default router