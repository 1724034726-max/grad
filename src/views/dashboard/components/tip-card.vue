<template>
  <el-card class="tip-card" shadow="hover">
    <div class="tip-card__inner">
      <div class="tip-card__icon-col" v-if="data.icon">
        <span class="tip-card__icon">
          <el-icon :size="40"><component :is="data.icon" /></el-icon>
        </span>
      </div>

      <div class="tip-card__content">
        <div class="tip-card__title">{{ data.title }}</div>
        <div class="tip-card__value">{{ data.value }}</div>
      </div>
    </div>
  </el-card>
</template>
<script setup lang="ts">
import type { Component } from 'vue'
interface Data {
    title: string
    value: number | string
    icon?: Component
}
defineProps<{
    data: Data
}>()
</script>
<style scoped lang="scss">
.tip-card {
  flex: 1;
  border-radius: 10px;

  &__inner {
    display: flex;
    gap: 12px;
  }

  &__icon-col {
    display: inline-flex;
    align-items: center;
  }

  &__content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &__icon {
    width: 55px;
    height: 55px;
    border-radius: 8px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
  }

  &__title {
    font-size: 15px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--el-text-color-secondary);
  }

  &__value {
    font-size: 22px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    line-height: 1.1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
</style>