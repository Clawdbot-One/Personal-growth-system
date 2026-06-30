import request from './request.js'
export function analyzeLeverage(data) { return request.post('/leverage-analysis', data) }
export function getLeverageHistory() { return request.get('/leverage-analysis/history') }
