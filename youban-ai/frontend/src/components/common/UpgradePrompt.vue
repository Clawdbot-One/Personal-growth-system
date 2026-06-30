<template>
  <div class="upgrade-prompt">
    <el-result
      icon="warning"
      :title="title || '功能受限'"
      :sub-title="subTitle || '当前会员等级无法使用此功能，请升级会员后继续。'"
    >
      <template #extra>
        <div class="usage-info" v-if="usageInfo">
          <el-tag type="warning" size="large">
            本月已用 {{ usageInfo.usage }} / {{ usageInfo.limit === Infinity ? '∞' : usageInfo.limit }} 次
          </el-tag>
        </div>
        <el-button type="primary" size="large" @click="$router.push('/upgrade')">
          立即升级
        </el-button>
        <el-button size="large" @click="$router.push('/home')">
          返回首页
        </el-button>
      </template>
    </el-result>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, default: '' },
  subTitle: { type: String, default: '' },
  usageInfo: { type: Object, default: null },
})
</script>

<style scoped>
.upgrade-prompt {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  padding: 40px;
}
.usage-info {
  margin-bottom: 16px;
}
</style>