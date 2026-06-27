import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import HelloWorld from '@/components/HelloWorld.vue'

describe('HelloWorld 组件', () => {
  it('应正确渲染组件', () => {
    const wrapper = mount(HelloWorld)
    expect(wrapper.exists()).toBe(true)
  })

  it('应显示 Get started 标题', () => {
    const wrapper = mount(HelloWorld)
    expect(wrapper.text()).toContain('Get started')
  })

  it('点击按钮应增加 count', async () => {
    const wrapper = mount(HelloWorld)
    const button = wrapper.find('button.counter')
    expect(button.exists()).toBe(true)
    expect(button.text()).toContain('Count is 0')
    await button.trigger('click')
    expect(button.text()).toContain('Count is 1')
  })

  it('应显示文档链接', () => {
    const wrapper = mount(HelloWorld)
    expect(wrapper.text()).toContain('Documentation')
    expect(wrapper.text()).toContain('Connect with us')
  })
})