import request from './request.js'
export function analyzeValue(data) { return request.post('/value-analysis', data) }
export function getValueHistory() { return request.get('/value-analysis/history') }
