import request from './request.js'

export function startDualSystemTest() {
  return request.post('/dual-system/start')
}

export function submitDualSystemAnswer(data) {
  return request.post('/dual-system/submit', data)
}

export function getDualSystemResult(sessionId) {
  return request.get(`/dual-system/result/${sessionId}`)
}

export function getDualSystemHistory() {
  return request.get('/dual-system/history')
}