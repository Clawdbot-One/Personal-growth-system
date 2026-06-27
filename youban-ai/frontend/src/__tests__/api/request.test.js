import { describe, it, expect, beforeEach, vi } from 'vitest'
import axios from 'axios'

vi.mock('element-plus', () => ({
  ElMessage: {
    error: vi.fn(),
  },
}))

describe('API Request 模块', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('应创建 axios 实例并配置 baseURL 和 timeout', async () => {
    const request = await import('@/api/request')
    const instance = request.default
    expect(instance.defaults.baseURL).toBe('/api')
    expect(instance.defaults.timeout).toBe(30000)
  })

  it('请求拦截器应在有 token 时添加 Authorization 头', async () => {
    localStorage.setItem('youban_token', 'test_token_123')
    const request = await import('@/api/request')
    const config = { headers: {} }
    const interceptor = request.default.interceptors.request.handlers[0]
    const result = interceptor.fulfilled(config)
    expect(result.headers.Authorization).toBe('Bearer test_token_123')
  })

  it('请求拦截器应在无 token 时不添加 Authorization 头', async () => {
    const request = await import('@/api/request')
    const config = { headers: {} }
    const interceptor = request.default.interceptors.request.handlers[0]
    const result = interceptor.fulfilled(config)
    expect(result.headers.Authorization).toBeUndefined()
  })

  it('请求拦截器错误处理应 reject error', async () => {
    const request = await import('@/api/request')
    const interceptor = request.default.interceptors.request.handlers[0]
    const error = new Error('network error')
    await expect(interceptor.rejected(error)).rejects.toThrow('network error')
  })

  it('响应拦截器应在 code=0 时返回 data', async () => {
    const request = await import('@/api/request')
    const interceptor = request.default.interceptors.response.handlers[0]
    const response = { data: { code: 0, data: { id: 1 }, message: 'success' } }
    const result = interceptor.fulfilled(response)
    expect(result).toEqual({ code: 0, data: { id: 1 }, message: 'success' })
  })

  it('响应拦截器应在 code !== 0 时 reject', async () => {
    const { ElMessage } = await import('element-plus')
    const request = await import('@/api/request')
    const interceptor = request.default.interceptors.response.handlers[0]
    const response = { data: { code: 1, message: '业务错误' } }
    await expect(interceptor.fulfilled(response)).rejects.toThrow('业务错误')
    expect(ElMessage.error).toHaveBeenCalledWith('业务错误')
  })

  it('响应拦截器应在 code !== 0 且无 message 时使用默认消息', async () => {
    const { ElMessage } = await import('element-plus')
    const request = await import('@/api/request')
    const interceptor = request.default.interceptors.response.handlers[0]
    const response = { data: { code: 1 } }
    await expect(interceptor.fulfilled(response)).rejects.toThrow(undefined)
    expect(ElMessage.error).toHaveBeenCalledWith('请求失败')
  })

  it('响应拦截器应在 401 时提示登录过期', async () => {
    const { ElMessage } = await import('element-plus')
    const request = await import('@/api/request')
    const interceptor = request.default.interceptors.response.handlers[0]
    const error = { response: { status: 401 }, message: 'Unauthorized' }
    await expect(interceptor.rejected(error)).rejects.toEqual(error)
    expect(ElMessage.error).toHaveBeenCalledWith('登录已过期，请重新登录')
  })

  it('响应拦截器应在非 401 错误时提示网络错误', async () => {
    const { ElMessage } = await import('element-plus')
    const request = await import('@/api/request')
    const interceptor = request.default.interceptors.response.handlers[0]
    const error = { response: { status: 500 }, message: 'Server Error' }
    await expect(interceptor.rejected(error)).rejects.toEqual(error)
    expect(ElMessage.error).toHaveBeenCalledWith('Server Error')
  })

  it('响应拦截器应在无 error.message 时提示默认网络错误', async () => {
    const { ElMessage } = await import('element-plus')
    const request = await import('@/api/request')
    const interceptor = request.default.interceptors.response.handlers[0]
    const error = {}
    await expect(interceptor.rejected(error)).rejects.toEqual(error)
    expect(ElMessage.error).toHaveBeenCalledWith('网络错误')
  })
})