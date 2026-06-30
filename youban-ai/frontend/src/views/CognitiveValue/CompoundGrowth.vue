<template>
  <AppLayout>
    <div class="cg-index">
      <div class="page-header">
        <h1>📈 复利成长引擎</h1>
        <p>每天进步1%，一年后强大37倍——追踪你的复利成长轨迹</p>
      </div>
      <div class="streak-bar" v-if="store.streakStats">
        <div class="streak-item"><span class="streak-num">{{ store.streakStats.todayCompleted }}/{{ store.streakStats.totalToday }}</span><span>今日打卡</span></div>
        <div class="streak-item"><span class="streak-num">{{ store.streakStats.weekCompleted }}</span><span>本周完成</span></div>
        <div class="streak-item"><span class="streak-num">{{ store.streakStats.longestStreak }}天</span><span>最长连续</span></div>
      </div>

      <h3>微习惯打卡</h3>
      <div class="habits-grid">
        <div class="habit-card" v-for="h in store.habits" :key="h.id" :class="{ completed: h.completed }" @click="store.toggleHabit(h.dimension, h.name)">
          <div class="habit-check" :class="{ checked: h.completed }">{{ h.completed ? '✓' : '' }}</div>
          <div class="habit-info">
            <span class="habit-name">{{ h.name }}</span>
            <span class="habit-desc">{{ h.description }}</span>
            <span class="habit-streak">连续 {{ h.streak }} 天</span>
          </div>
        </div>
      </div>

      <h3>成长曲线</h3>
      <div class="growth-list">
        <div class="growth-card" v-for="g in store.growthData" :key="g.dimension">
          <div class="growth-header">
            <span>{{ g.icon }} {{ g.dimensionName }}</span>
            <el-tag size="small">日增长率 {{ g.dailyGrowthRate }}%</el-tag>
          </div>
          <el-progress :percentage="Math.round(g.currentLevel)" :stroke-width="12" :color="getGrowthColor(g.currentLevel)" />
          <div class="growth-meta">
            <span>连续 {{ g.streakDays }} 天</span>
            <span>预计 {{ g.projectedMilestoneDate }} 达到 {{ g.nextMilestone }}</span>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import AppLayout from '@/components/layout/AppLayout.vue'
import { useCompoundGrowthStore } from '@/stores/compoundGrowth'
import { onMounted } from 'vue'

const store = useCompoundGrowthStore()

onMounted(async () => {
  await Promise.all([store.fetchGrowthData(), store.fetchHabits(), store.fetchStreakStats()])
})

function getGrowthColor(level) { return level >= 75 ? '#67C23A' : level >= 50 ? '#2563EB' : level >= 25 ? '#E6A23C' : '#F56C6C' }
</script>

<style scoped>
.cg-index { max-width: 900px; margin: 0 auto; }
.page-header { text-align: center; margin-bottom: 36px; }
.page-header h1 { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
.page-header p { font-size: 15px; color: var(--text-secondary); }
.streak-bar { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 36px; }
.streak-item { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 20px; text-align: center; }
.streak-num { font-size: 24px; font-weight: 700; display: block; margin-bottom: 4px; color: #2563EB; }
.streak-item span:last-child { font-size: 13px; color: var(--text-muted); }
.cg-index h3 { font-size: 18px; font-weight: 600; margin: 24px 0 16px; }
.habits-grid { display: flex; flex-direction: column; gap: 10px; margin-bottom: 36px; }
.habit-card { display: flex; align-items: center; gap: 14px; padding: 14px 16px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 10px; cursor: pointer; transition: all 0.2s; }
.habit-card:hover { background: rgba(37,99,235,0.04); }
.habit-card.completed { border-color: #67C23A; background: rgba(103,194,58,0.04); }
.habit-check { width: 28px; height: 28px; border-radius: 50%; border: 2px solid var(--border); display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0; }
.habit-check.checked { background: #67C23A; border-color: #67C23A; color: white; }
.habit-info { display: flex; flex-direction: column; gap: 2px; flex: 1; }
.habit-name { font-size: 14px; font-weight: 600; }
.habit-desc { font-size: 12px; color: var(--text-muted); }
.habit-streak { font-size: 12px; color: #2563EB; font-weight: 500; }
.growth-list { display: flex; flex-direction: column; gap: 16px; }
.growth-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 20px; }
.growth-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; font-size: 15px; font-weight: 600; }
.growth-meta { display: flex; justify-content: space-between; margin-top: 8px; font-size: 12px; color: var(--text-muted); }
</style>