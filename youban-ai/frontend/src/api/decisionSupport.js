import request from './request.js'
export function createDecision(data) { return request.post('/decision', data) }
export function analyzeDecision(data) { return request.post('/decision/analyze', data) }
export function completeDecision(data) { return request.post('/decision/complete', data) }
export function getDecisionHistory() { return request.get('/decision/history') }
