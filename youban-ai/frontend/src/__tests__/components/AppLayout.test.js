import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'

describe('AppLayout 组件', () => {
  let router

  beforeEach(() => {
    setActivePinia(createPinia())
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', name: 'Home', component: { template: '<div>Home</div>' } },
        { path: '/assessment', name: 'Assessment', component: { template: '<div>Assessment</div>' } },
        { path: '/growth', name: 'Growth', component: { template: '<div>Growth</div>' } },
        { path: '/assistant', name: 'Assistant', component: { template: '<div>Assistant</div>' } },
        { path: '/practice', name: 'Practice', component: { template: '<div>Practice</div>' } },
        { path: '/profile', name: 'Profile', component: { template: '<div>Profile</div>' } },
      ],
    })
  })

  it('应正确渲染布局结构', async () => {
    router.push('/')
    await router.isReady()
    const wrapper = mount(AppLayout, {
      global: { plugins: [router] },
    })
    expect(wrapper.find('.app-layout').exists()).toBe(true)
    expect(wrapper.find('.main-content').exists()).toBe(true)
  })

  it('应渲染侧边栏导航项', async () => {
    router.push('/')
    await router.isReady()
    const wrapper = mount(AppLayout, {
      global: { plugins: [router] },
    })
    const navItems = wrapper.findAll('.nav-item')
    expect(navItems.length).toBeGreaterThan(0)
  })

  it('应包含 logo 文字', async () => {
    router.push('/')
    await router.isReady()
    const wrapper = mount(AppLayout, {
      global: { plugins: [router] },
    })
    expect(wrapper.text()).toContain('优伴AI')
  })
})