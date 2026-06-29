import request from './request.js'

export function startBiasTest() {
  return request.post('/cognitive-bias/start')
}

export function submitBiasAnswer(data) {
  return request.post('/cognitive-bias/submit', data)
}

export function getBiasResult(sessionId) {
  return request.get(`/cognitive-bias/result/${sessionId}`)
}

export function getBiasHistory() {
  return request.get('/cognitive-bias/history')
}