import request from './request.js'

export function startCalibrationTest() {
  return request.post('/calibration/start')
}

export function submitCalibrationAnswer(data) {
  return request.post('/calibration/submit', data)
}

export function getCalibrationResult(sessionId) {
  return request.get(`/calibration/result/${sessionId}`)
}

export function getCalibrationHistory() {
  return request.get('/calibration/history')
}