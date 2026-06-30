import request from './request.js'

export function startCognitiveLevelTest() {
  return request.post('/cognitive-level/start')
}

export function submitCognitiveLevelAnswers(data) {
  return request.post('/cognitive-level/submit', data)
}

export function getCognitiveLevelResult(sessionId) {
  return request.get(`/cognitive-level/result/${sessionId}`)
}

export function getCognitiveLevelHistory() {
  return request.get('/cognitive-level/history')
}