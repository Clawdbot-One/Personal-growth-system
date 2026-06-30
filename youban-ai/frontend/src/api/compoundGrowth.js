import request from './request.js'
export function getCompoundGrowth() { return request.get('/compound-growth') }
export function getMicroHabits() { return request.get('/micro-habits') }
export function toggleMicroHabit(data) { return request.post('/micro-habits/toggle', data) }
export function getStreakStats() { return request.get('/streak-stats') }
