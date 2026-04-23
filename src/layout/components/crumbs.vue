<template>
  <div class="crumbs">
    <template v-for="item in routeHistory" :key="item.path">
      <div :class="['crumbs_item', { 'crumbs_item_active': item.path === currentRoute.path }]" @click="onCrumbsClick(item.path)">
        <span>{{ item.name }}</span>
        <el-icon @click.stop="onDeleteRouteHistory(item.path)" v-if='routeHistory.length > 1'><Close /></el-icon>
      </div>
    </template>
  </div>
</template>
<script setup lang="ts">
import { Close } from '@element-plus/icons-vue'
import { useWatchRouter } from '@/composables'
const { routeHistory, currentRoute, router, onDeleteRouteHistory } = useWatchRouter()
const onCrumbsClick = (path: string) => {
  router.push(path)
}
</script>
<style scoped lang="scss">
.crumbs {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 15px;
  
  &_item {
    display: flex;
    align-items: center;
    justify-content: center;
    column-gap: 5px;
    font-size: 14px;
    padding: 5px 12px;
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.3s ease;

    .el-icon {
      font-size: 10px; 
      max-width: 16px;
      transition: transform 0.18s ease;
      &:hover {
        transform: scale(1.2);
      }
    }

    &:hover {
      background-color: var(--el-color-primary-light-9);
      color: var(--el-color-primary);
    }
    &_active {
      background-color: var(--el-color-primary-light-9);
      color: var(--el-color-primary);
    }
  }
}
</style>