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
  const menuList = computed(
    () => router.options.routes[0]?.children?.filter((r) => !r.meta?.hidden) ?? []
  )
  const route = useRoute()
  const activeIndex = computed(() => {
    const p = route.path
    if (p.startsWith('/correction-notebook')) return '/correction-notebook'
    return p
  })
</script>
<style scoped lang="scss">
  .el-menu {
    height: 100vh;
    overflow-y: auto;
  }
</style>
