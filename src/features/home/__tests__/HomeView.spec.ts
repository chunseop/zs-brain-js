import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'

import HomeView from '@/features/home/HomeView.vue'
import zh from '@/locales/zh.json'

function mountHome() {
  const i18n = createI18n({
    legacy: false,
    locale: 'zh',
    messages: { zh },
  })
  const router = createRouter({
    history: createWebHistory(),
    routes: [{ path: '/', component: HomeView }],
  })

  return mount(HomeView, {
    global: {
      plugins: [i18n, router],
    },
  })
}

describe('HomeView', () => {
  it('shows the simplified game entries in Chinese', () => {
    setActivePinia(createPinia())
    const wrapper = mountHome()

    expect(wrapper.text()).toContain('大小比较')
    expect(wrapper.text()).toContain('颜色点击')
    expect(wrapper.text()).toContain('文章朗读')
    expect(wrapper.text()).toContain('平衡控制')
    expect(wrapper.text().indexOf('文章朗读')).toBeLessThan(
      wrapper.text().indexOf('平衡控制'),
    )
    expect(wrapper.text()).not.toContain('今日训练')
    expect(wrapper.text()).not.toContain('分类训练')
    expect(wrapper.text()).not.toContain('训练日历')
    expect(wrapper.text()).not.toContain('能力分析')
    expect(wrapper.text()).not.toContain('家人中心')
  })
})
