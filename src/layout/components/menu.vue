<template>
  <el-menu router :default-active="activeIndex">
    <el-menu-item v-for="item in menuList" :key="item.path" :index="item.path">
      <template #title>
        <el-icon><component :is="item.meta?.icon" /></el-icon>
        <span>{{ item.meta?.title }}</span>
      </template>
    </el-menu-item>
  </el-menu>
</template>
<script setup lang="ts">
  import { useRouter } from 'vue-router'
  import { useRoute } from 'vue-router'
  import { computed } from 'vue'
  const router = useRouter()
  const menuList = computed(() => router.options.routes[0]?.children)
  const route = useRoute()
  const activeIndex = computed(() => route.path)
</script>
<style scoped lang="scss">
  .el-menu {
    height: 100vh;
    overflow-y: auto;
  }
</style>
