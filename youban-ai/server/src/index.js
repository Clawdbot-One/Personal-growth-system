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

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

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

app.listen(PORT, () => {
  console.log(`优伴AI 会员服务已启动: http://localhost:${PORT}`)
})