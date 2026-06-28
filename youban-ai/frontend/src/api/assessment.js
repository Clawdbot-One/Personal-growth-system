import request from './request.js'

/**
 * 保存测评报告
 */
export function saveAssessment(data) {
  return request.post('/assessment', data)
}

/**
 * 获取用户的所有测评报告
 */
export function getAssessments() {
  return request.get('/assessment')
}