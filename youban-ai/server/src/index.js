import express from 'express'
import cors from 'cors'
import './db/init.js'
import { register, login, getProfile, updateProfile, updateLearningData } from './routes/auth.js'
import { getAllMembers, getMemberDetail, updateMemberStatus, getMemberStats, getAdminAccounts, createAdminAccount, deleteAdminAccount, resetAdminPassword } from './routes/admin.js'
import { getRecommendations, acceptRecommendation, rejectRecommendation } from './services/recommendation.js'
import {
  getLearningData, saveAssessment, getAssessments,
  getGoals, createGoal, updateGoal,
  getPractices, addPractice,
} from './routes/learning.js'
import { authMiddleware, adminMiddleware } from './middleware/auth.js'
import {
  getPlans, createPlan, updatePlanStatus,
  getSessions, createSession,
  getQualityScores, getZoneAssessment,
  getFeedbackRecords, adoptFeedback,
  getFocusSessions, recordFocusSession,
  getMentalAssessments, createMentalAssessment,
  getDashboard,
} from './routes/deliberatePractice.js'
import {
  startBiasTest, submitBiasAnswer, getBiasResult, getBiasHistory,
} from './routes/cognitiveBias.js'
import {
  startDualSystemTest, submitDualSystemAnswer, getDualSystemResult, getDualSystemHistory,
} from './routes/dualSystem.js'
import {
  startCalibrationTest, submitCalibrationAnswer, getCalibrationResult, getCalibrationHistory,
} from './routes/calibration.js'
import {
  startCognitiveLevelTest, submitCognitiveLevelAnswers, getCognitiveLevelResult, getCognitiveLevelHistory,
} from './routes/cognitiveLevel.js'
import { analyzeValuePositioning, getValueAnalysisHistory } from './routes/valueAnalysis.js'
import { analyzeLeveragePoints, getLeverageAnalysisHistory } from './routes/leverageAnalysis.js'
import { getCompoundGrowthData, getMicroHabits, toggleMicroHabit, getStreakStats } from './routes/compoundGrowth.js'
import { getKnowledgeNetwork, updateKnowledgeNode } from './routes/knowledgeNetwork.js'
import { createDecision, analyzeDecision, completeDecision, getDecisionHistory } from './routes/decisionSupport.js'

const app = express()
const PORT = process.env.PORT || 3001

// 禁用 ETag，防止浏览器缓存导致 304 响应和潜在的 400 错误缓存
app.set('etag', false)

app.use(cors())
app.use(express.json())

// Request logging middleware
app.use((req, res, next) => {
  // 禁用浏览器缓存，防止 304 响应导致 stale 数据
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate')
  res.set('Pragma', 'no-cache')
  res.set('Expires', '0')
  
  const start = Date.now()
  res.on('finish', () => {
    const duration = Date.now() - start
    console.log(`[${res.statusCode}] ${req.method} ${req.originalUrl} - ${duration}ms (${req.get('user-agent')?.substring(0,50) || 'no-ua'})`)
    if (res.statusCode >= 400 && Object.keys(req.query).length > 0) {
      console.log(`  Query:`, req.query)
    }
    if (res.statusCode >= 400 && req.body && Object.keys(req.body).length > 0) {
      console.log(`  Body:`, req.body)
    }
  })
  next()
})

// ========== Auth Routes ==========
app.post('/api/auth/register', register)
app.post('/api/auth/login', login)
app.get('/api/auth/profile', authMiddleware, getProfile)
app.put('/api/auth/profile', authMiddleware, updateProfile)
app.put('/api/auth/learning-data', authMiddleware, updateLearningData)

// ========== Learning Routes ==========
app.get('/api/learning/data', authMiddleware, getLearningData)
app.post('/api/assessment', authMiddleware, saveAssessment)
app.get('/api/assessment', authMiddleware, getAssessments)
app.get('/api/goals', authMiddleware, getGoals)
app.post('/api/goals', authMiddleware, createGoal)
app.put('/api/goals/:id', authMiddleware, updateGoal)
app.get('/api/practices', authMiddleware, getPractices)
app.post('/api/practices', authMiddleware, addPractice)

// ========== Recommendation Routes ==========
app.get('/api/recommendations', authMiddleware, getRecommendations)
app.post('/api/recommendations/:id/accept', authMiddleware, acceptRecommendation)
app.post('/api/recommendations/:id/reject', authMiddleware, rejectRecommendation)

// ========== Admin Routes ==========
app.get('/api/admin/members', authMiddleware, adminMiddleware, getAllMembers)
app.get('/api/admin/members/stats', authMiddleware, adminMiddleware, getMemberStats)
app.get('/api/admin/members/:id', authMiddleware, adminMiddleware, getMemberDetail)
app.put('/api/admin/members/:id', authMiddleware, adminMiddleware, updateMemberStatus)

// ========== Admin Account Management ==========
app.get('/api/admin/accounts', authMiddleware, adminMiddleware, getAdminAccounts)
app.post('/api/admin/accounts', authMiddleware, adminMiddleware, createAdminAccount)
app.delete('/api/admin/accounts/:id', authMiddleware, adminMiddleware, deleteAdminAccount)
app.put('/api/admin/accounts/:id/password', authMiddleware, adminMiddleware, resetAdminPassword)

// ========== Deliberate Practice Routes ==========
app.get('/api/dp/dashboard', authMiddleware, getDashboard)
app.get('/api/dp/plans', authMiddleware, getPlans)
app.post('/api/dp/plans', authMiddleware, createPlan)
app.put('/api/dp/plans/:id', authMiddleware, updatePlanStatus)
app.get('/api/dp/sessions', authMiddleware, getSessions)
app.post('/api/dp/sessions', authMiddleware, createSession)
app.get('/api/dp/quality', authMiddleware, getQualityScores)
app.get('/api/dp/zone', authMiddleware, getZoneAssessment)
app.get('/api/dp/feedback', authMiddleware, getFeedbackRecords)
app.post('/api/dp/feedback/:id/adopt', authMiddleware, adoptFeedback)
app.get('/api/dp/focus', authMiddleware, getFocusSessions)
app.post('/api/dp/focus', authMiddleware, recordFocusSession)
app.get('/api/dp/mental', authMiddleware, getMentalAssessments)
app.post('/api/dp/mental', authMiddleware, createMentalAssessment)

// 认知偏差扫描仪
app.post('/api/cognitive-bias/start', authMiddleware, startBiasTest)
app.post('/api/cognitive-bias/submit', authMiddleware, submitBiasAnswer)
app.get('/api/cognitive-bias/result/:sessionId', authMiddleware, getBiasResult)
app.get('/api/cognitive-bias/history', authMiddleware, getBiasHistory)

// 双系统思维训练
app.post('/api/dual-system/start', authMiddleware, startDualSystemTest)
app.post('/api/dual-system/submit', authMiddleware, submitDualSystemAnswer)
app.get('/api/dual-system/result/:sessionId', authMiddleware, getDualSystemResult)
app.get('/api/dual-system/history', authMiddleware, getDualSystemHistory)

// 过度自信校准
app.post('/api/calibration/start', authMiddleware, startCalibrationTest)
app.post('/api/calibration/submit', authMiddleware, submitCalibrationAnswer)
app.get('/api/calibration/result/:sessionId', authMiddleware, getCalibrationResult)
app.get('/api/calibration/history', authMiddleware, getCalibrationHistory)

// 认知层次诊断
app.post('/api/cognitive-level/start', authMiddleware, startCognitiveLevelTest)
app.post('/api/cognitive-level/submit', authMiddleware, submitCognitiveLevelAnswers)
app.get('/api/cognitive-level/result/:sessionId', authMiddleware, getCognitiveLevelResult)
app.get('/api/cognitive-level/history', authMiddleware, getCognitiveLevelHistory)

// 价值定位分析
app.post('/api/value-analysis', authMiddleware, analyzeValuePositioning)
app.get('/api/value-analysis/history', authMiddleware, getValueAnalysisHistory)

// 杠杆点分析
app.post('/api/leverage-analysis', authMiddleware, analyzeLeveragePoints)
app.get('/api/leverage-analysis/history', authMiddleware, getLeverageAnalysisHistory)

// 复利成长追踪
app.get('/api/compound-growth', authMiddleware, getCompoundGrowthData)
app.get('/api/micro-habits', authMiddleware, getMicroHabits)
app.post('/api/micro-habits/toggle', authMiddleware, toggleMicroHabit)
app.get('/api/streak-stats', authMiddleware, getStreakStats)

// 知识网络
app.get('/api/knowledge-network', authMiddleware, getKnowledgeNetwork)
app.post('/api/knowledge-network/update', authMiddleware, updateKnowledgeNode)

// 决策辅助
app.post('/api/decision', authMiddleware, createDecision)
app.post('/api/decision/analyze', authMiddleware, analyzeDecision)
app.post('/api/decision/complete', authMiddleware, completeDecision)
app.get('/api/decision/history', authMiddleware, getDecisionHistory)

app.listen(PORT, () => {
  console.log(`优伴AI 会员服务已启动: http://localhost:${PORT}`)
})