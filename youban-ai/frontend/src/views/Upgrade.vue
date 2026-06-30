<template>
  <div class="upgrade-page">
    <div class="page-header">
      <h1>升级会员</h1>
      <p class="subtitle">选择适合你的会员方案，解锁更多功能</p>
    </div>

    <div class="current-level" v-if="membershipStore.levelLabel">
      <el-tag type="primary" size="large" effect="dark">
        当前等级：{{ membershipStore.levelLabel }}
      </el-tag>
    </div>

    <div class="plans-grid">
      <el-card class="plan-card" :class="{ active: membershipStore.level === 'free' }" shadow="hover">
        <div class="plan-header">
          <h3>免费版</h3>
          <div class="plan-price">
            <span class="price">¥0</span>
            <span class="period">/月</span>
          </div>
        </div>
        <div class="plan-features">
          <div class="feature-item">
            <el-icon class="check"><Check /></el-icon>
            <span>快速测评（不限次）</span>
          </div>
          <div class="feature-item">
            <el-icon class="check"><Check /></el-icon>
            <span>基础成长路径</span>
          </div>
          <div class="feature-item">
            <el-icon class="check"><Check /></el-icon>
            <span>AI助手 10次/天</span>
          </div>
          <div class="feature-item limited">
            <el-icon class="check"><Close /></el-icon>
            <span>认知偏差扫描 1次/月</span>
          </div>
          <div class="feature-item limited">
            <el-icon class="check"><Close /></el-icon>
            <span>思维训练 3次/月</span>
          </div>
          <div class="feature-item limited">
            <el-icon class="check"><Close /></el-icon>
            <span>完整版测评不可用</span>
          </div>
        </div>
        <div class="plan-action">
          <el-button v-if="membershipStore.level === 'free'" disabled type="info" size="large" round>
            当前方案
          </el-button>
          <el-button v-else disabled size="large" round>已过期</el-button>
        </div>
      </el-card>

      <el-card class="plan-card recommended" :class="{ active: membershipStore.level === 'premium' }" shadow="hover">
        <div class="plan-badge">推荐</div>
        <div class="plan-header">
          <h3>高级版</h3>
          <div class="plan-price">
            <span class="price">¥29.9</span>
            <span class="period">/月</span>
          </div>
        </div>
        <div class="plan-features">
          <div class="feature-item">
            <el-icon class="check"><Check /></el-icon>
            <span>完整版测评可用</span>
          </div>
          <div class="feature-item">
            <el-icon class="check"><Check /></el-icon>
            <span>认知偏差扫描 3次/月</span>
          </div>
          <div class="feature-item">
            <el-icon class="check"><Check /></el-icon>
            <span>思维训练 10次/月</span>
          </div>
          <div class="feature-item">
            <el-icon class="check"><Check /></el-icon>
            <span>自信校准 3次/月</span>
          </div>
          <div class="feature-item">
            <el-icon class="check"><Check /></el-icon>
            <span>认知层次诊断 3次/月</span>
          </div>
          <div class="feature-item">
            <el-icon class="check"><Check /></el-icon>
            <span>AI助手 50次/天</span>
          </div>
          <div class="feature-item">
            <el-icon class="check"><Check /></el-icon>
            <span>决策辅助 5个/月</span>
          </div>
        </div>
        <div class="plan-action">
          <el-button v-if="membershipStore.level === 'premium'" disabled type="info" size="large" round>
            当前方案
          </el-button>
          <el-button v-else-if="membershipStore.level === 'free'" type="primary" size="large" round @click="handleUpgrade('premium')">
            立即升级
          </el-button>
          <el-button v-else disabled size="large" round>已过期</el-button>
        </div>
      </el-card>

      <el-card class="plan-card vip-card" :class="{ active: membershipStore.level === 'vip' }" shadow="hover">
        <div class="plan-header">
          <h3>VIP版</h3>
          <div class="plan-price">
            <span class="price">¥49.9</span>
            <span class="period">/月</span>
          </div>
        </div>
        <div class="plan-features">
          <div class="feature-item">
            <el-icon class="check"><Check /></el-icon>
            <span>全部功能 不限次数</span>
          </div>
          <div class="feature-item">
            <el-icon class="check"><Check /></el-icon>
            <span>访谈版测评可用</span>
          </div>
          <div class="feature-item">
            <el-icon class="check"><Check /></el-icon>
            <span>认知偏差 不限次</span>
          </div>
          <div class="feature-item">
            <el-icon class="check"><Check /></el-icon>
            <span>思维训练 不限次</span>
          </div>
          <div class="feature-item">
            <el-icon class="check"><Check /></el-icon>
            <span>自信校准 不限次</span>
          </div>
          <div class="feature-item">
            <el-icon class="check"><Check /></el-icon>
            <span>AI助手 不限次</span>
          </div>
          <div class="feature-item">
            <el-icon class="check"><Check /></el-icon>
            <span>决策辅助 不限个</span>
          </div>
        </div>
        <div class="plan-action">
          <el-button v-if="membershipStore.level === 'vip'" disabled type="info" size="large" round>
            当前方案
          </el-button>
          <el-button v-else type="primary" size="large" round @click="handleUpgrade('vip')">
            立即升级
          </el-button>
        </div>
      </el-card>
    </div>

    <div class="features-comparison">
      <h2>功能对比</h2>
      <el-table :data="comparisonData" border stripe style="width: 100%; max-width: 900px; margin: 0 auto;">
        <el-table-column prop="feature" label="功能" width="180" />
        <el-table-column label="免费版" width="120" align="center">
          <template #default="{ row }">
            <span v-if="row.free === '无限' || row.free === '✓'" class="check-icon">✓</span>
            <span v-else-if="row.free === '✗'" class="cross-icon">✗</span>
            <span v-else>{{ row.free }}</span>
          </template>
        </el-table-column>
        <el-table-column label="高级版" width="120" align="center">
          <template #default="{ row }">
            <span v-if="row.premium === '无限' || row.premium === '✓'" class="check-icon">✓</span>
            <span v-else-if="row.premium === '✗'" class="cross-icon">✗</span>
            <span v-else>{{ row.premium }}</span>
          </template>
        </el-table-column>
        <el-table-column label="VIP版" width="120" align="center">
          <template #default="{ row }">
            <span v-if="row.vip === '无限' || row.vip === '✓'" class="check-icon">✓</span>
            <span v-else>{{ row.vip }}</span>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useMembershipStore } from '@/stores/membership'

const membershipStore = useMembershipStore()

const comparisonData = [
  { feature: '快速测评', free: '无限', premium: '无限', vip: '无限' },
  { feature: '完整版测评', free: '✗', premium: '99次/月', vip: '无限' },
  { feature: '访谈版测评', free: '✗', premium: '✗', vip: '无限' },
  { feature: '认知偏差扫描', free: '1次/月', premium: '3次/月', vip: '无限' },
  { feature: '双系统思维训练', free: '3次/月', premium: '10次/月', vip: '无限' },
  { feature: '过度自信校准', free: '1次/月', premium: '3次/月', vip: '无限' },
  { feature: '认知层次诊断', free: '1次/月', premium: '3次/月', vip: '无限' },
  { feature: '价值定位分析', free: '1次/月', premium: '3次/月', vip: '无限' },
  { feature: '杠杆点分析', free: '1次/月', premium: '3次/月', vip: '无限' },
  { feature: '决策辅助', free: '1个/月', premium: '5个/月', vip: '无限' },
  { feature: 'AI助手', free: '10次/天', premium: '50次/天', vip: '无限' },
  { feature: '复利成长维度', free: '3个', premium: '5个', vip: '无限' },
  { feature: '知识网络节点', free: '10个', premium: '15个', vip: '无限' },
]

function handleUpgrade(level) {
  // TODO: 接入支付系统
  ElMessage.info(`升级到 ${level === 'vip' ? 'VIP版' : '高级版'} 功能即将上线，敬请期待`)
}

onMounted(() => {
  membershipStore.fetchLimits()
})
</script>

<style scoped>
.upgrade-page {
  max-width: 1100px;
  margin: 0 auto;
}
.page-header {
  text-align: center;
  margin-bottom: 24px;
}
.page-header h1 {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 8px;
}
.subtitle {
  color: var(--text-muted);
  font-size: 15px;
}
.current-level {
  text-align: center;
  margin-bottom: 32px;
}
.plans-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 48px;
}
.plan-card {
  position: relative;
  border-radius: 16px;
  transition: all 0.3s;
}
.plan-card.active {
  border-color: var(--primary);
  box-shadow: 0 0 0 2px var(--primary);
}
.plan-card.recommended {
  transform: scale(1.05);
  border-color: #f59e0b;
}
.plan-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: #fff;
  padding: 4px 20px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  z-index: 1;
}
.plan-header {
  text-align: center;
  padding: 20px 0 16px;
  border-bottom: 1px solid var(--border);
}
.plan-header h3 {
  font-size: 20px;
  margin-bottom: 8px;
}
.plan-price {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 2px;
}
.price {
  font-size: 36px;
  font-weight: 700;
  color: var(--primary);
}
.period {
  font-size: 14px;
  color: var(--text-muted);
}
.plan-features {
  padding: 20px 16px;
  min-height: 280px;
}
.feature-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  font-size: 14px;
}
.feature-item .check {
  color: #22c55e;
  font-size: 16px;
}
.feature-item.limited {
  color: var(--text-muted);
}
.feature-item.limited .check {
  color: #9ca3af;
}
.plan-action {
  padding: 0 16px 20px;
  text-align: center;
}
.plan-action .el-button {
  width: 100%;
}
.features-comparison {
  margin-top: 48px;
  text-align: center;
}
.features-comparison h2 {
  font-size: 22px;
  margin-bottom: 24px;
}
.check-icon {
  color: #22c55e;
  font-weight: 700;
}
.cross-icon {
  color: #ef4444;
  font-weight: 700;
}

@media (max-width: 768px) {
  .plans-grid {
    grid-template-columns: 1fr;
  }
  .plan-card.recommended {
    transform: none;
  }
}
</style>