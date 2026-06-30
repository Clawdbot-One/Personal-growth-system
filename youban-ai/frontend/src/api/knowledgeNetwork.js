import request from './request.js'
export function getKnowledgeNetwork() { return request.get('/knowledge-network') }
export function updateKnowledgeNode(data) { return request.post('/knowledge-network/update', data) }
