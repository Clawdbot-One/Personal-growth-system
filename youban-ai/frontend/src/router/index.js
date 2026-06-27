import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  // 首页
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { title: '优伴AI - 发现天赋优势', noLayout: true },
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
  // 管理后台
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: () => import('@/views/Admin/Dashboard.vue'),
    meta: { title: '管理后台', admin: true },
  },
  {
    path: '/admin/users',
    name: 'AdminUsers',
    component: () => import('@/views/Admin/Users.vue'),
    meta: { title: '用户管理', admin: true },
  },
  {
    path: '/admin/content',
    name: 'AdminContent',
    component: () => import('@/views/Admin/Content.vue'),
    meta: { title: '内容管理', admin: true },
  },
  {
    path: '/admin/system',
    name: 'AdminSystem',
    component: () => import('@/views/Admin/System.vue'),
    meta: { title: '系统配置', admin: true },
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
  next()
})

export default router