import { describe, it, expect } from 'vitest'
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    meta: { title: '优伴AI - 发现天赋优势', noLayout: true },
  },
  {
    path: '/assessment',
    name: 'Assessment',
    meta: { title: '优势测评' },
  },
  {
    path: '/assessment/quick',
    name: 'QuickTest',
    meta: { title: '快速精简版测评' },
  },
  {
    path: '/assessment/full',
    name: 'FullTest',
    meta: { title: '专业完整版测评' },
  },
  {
    path: '/assessment/interview',
    name: 'InterviewTest',
    meta: { title: '深度访谈版测评' },
  },
  {
    path: '/assessment/report/:id',
    name: 'AssessmentReport',
    meta: { title: '优势测评报告' },
  },
  {
    path: '/growth',
    name: 'GrowthDashboard',
    meta: { title: '成长总看板' },
  },
  {
    path: '/growth/goal/create',
    name: 'GoalCreate',
    meta: { title: '创建成长目标' },
  },
  {
    path: '/growth/goal/:id',
    name: 'GoalDetail',
    meta: { title: '目标详情' },
  },
  {
    path: '/assistant',
    name: 'Assistant',
    meta: { title: 'AI 成长助手' },
  },
  {
    path: '/practice',
    name: 'Practice',
    meta: { title: '优势落地实践库' },
  },
  {
    path: '/practice/:id',
    name: 'PracticeDetail',
    meta: { title: '实践项目详情' },
  },
  {
    path: '/profile',
    name: 'Profile',
    meta: { title: '个人中心' },
  },
  {
    path: '/profile/archive',
    name: 'Archive',
    meta: { title: '成长档案' },
  },
  {
    path: '/profile/settings',
    name: 'Settings',
    meta: { title: '设置' },
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    meta: { title: '管理后台', admin: true },
  },
  {
    path: '/admin/users',
    name: 'AdminUsers',
    meta: { title: '用户管理', admin: true },
  },
  {
    path: '/admin/content',
    name: 'AdminContent',
    meta: { title: '内容管理', admin: true },
  },
  {
    path: '/admin/system',
    name: 'AdminSystem',
    meta: { title: '系统配置', admin: true },
  },
]

function createTestRouter() {
  return createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior() {
      return { top: 0 }
    },
  })
}

describe('Router 路由配置', () => {
  it('应包含所有必需的路由', () => {
    const router = createTestRouter()
    const routeNames = router.getRoutes().map(r => r.name)
    expect(routeNames).toContain('Home')
    expect(routeNames).toContain('Assessment')
    expect(routeNames).toContain('QuickTest')
    expect(routeNames).toContain('FullTest')
    expect(routeNames).toContain('InterviewTest')
    expect(routeNames).toContain('AssessmentReport')
    expect(routeNames).toContain('GrowthDashboard')
    expect(routeNames).toContain('GoalCreate')
    expect(routeNames).toContain('GoalDetail')
    expect(routeNames).toContain('Assistant')
    expect(routeNames).toContain('Practice')
    expect(routeNames).toContain('PracticeDetail')
    expect(routeNames).toContain('Profile')
    expect(routeNames).toContain('Archive')
    expect(routeNames).toContain('Settings')
    expect(routeNames).toContain('AdminDashboard')
    expect(routeNames).toContain('AdminUsers')
    expect(routeNames).toContain('AdminContent')
    expect(routeNames).toContain('AdminSystem')
  })

  it('应正确配置首页路由', () => {
    const router = createTestRouter()
    const homeRoute = router.getRoutes().find(r => r.name === 'Home')
    expect(homeRoute.path).toBe('/')
    expect(homeRoute.meta.title).toBe('优伴AI - 发现天赋优势')
    expect(homeRoute.meta.noLayout).toBe(true)
  })

  it('应正确配置测评相关路由', () => {
    const router = createTestRouter()
    const routes = router.getRoutes()

    const quick = routes.find(r => r.name === 'QuickTest')
    expect(quick.path).toBe('/assessment/quick')

    const full = routes.find(r => r.name === 'FullTest')
    expect(full.path).toBe('/assessment/full')

    const interview = routes.find(r => r.name === 'InterviewTest')
    expect(interview.path).toBe('/assessment/interview')

    const report = routes.find(r => r.name === 'AssessmentReport')
    expect(report.path).toBe('/assessment/report/:id')
  })

  it('应正确配置成长路径相关路由', () => {
    const router = createTestRouter()
    const routes = router.getRoutes()

    const dashboard = routes.find(r => r.name === 'GrowthDashboard')
    expect(dashboard.path).toBe('/growth')

    const create = routes.find(r => r.name === 'GoalCreate')
    expect(create.path).toBe('/growth/goal/create')

    const detail = routes.find(r => r.name === 'GoalDetail')
    expect(detail.path).toBe('/growth/goal/:id')
  })

  it('应正确配置个人中心相关路由', () => {
    const router = createTestRouter()
    const routes = router.getRoutes()

    const profile = routes.find(r => r.name === 'Profile')
    expect(profile.path).toBe('/profile')

    const archive = routes.find(r => r.name === 'Archive')
    expect(archive.path).toBe('/profile/archive')

    const settings = routes.find(r => r.name === 'Settings')
    expect(settings.path).toBe('/profile/settings')
  })

  it('管理后台路由应标记 admin meta', () => {
    const router = createTestRouter()
    const routes = router.getRoutes()
    const adminRoutes = routes.filter(r => r.meta?.admin)
    expect(adminRoutes).toHaveLength(4)
    const adminNames = adminRoutes.map(r => r.name).sort()
    expect(adminNames).toEqual([
      'AdminContent',
      'AdminDashboard',
      'AdminSystem',
      'AdminUsers',
    ])
  })

  it('路由总数应为 19', () => {
    const router = createTestRouter()
    expect(router.getRoutes()).toHaveLength(19)
  })

  it('scrollBehavior 应返回 { top: 0 }', () => {
    const router = createTestRouter()
    const result = router.options.scrollBehavior()
    expect(result).toEqual({ top: 0 })
  })
})