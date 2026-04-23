<template>
      <el-container>
        <el-aside width="200px"><Menu /></el-aside>
        <el-container>
          <el-header><Crumbs /></el-header>
          <el-main>
            <RouterView />
          </el-main>
        </el-container>
      </el-container>
  </template>
  <script setup lang="ts">
import Menu from './components/menu.vue'
import Crumbs from './components/crumbs.vue'
import { RouterView } from 'vue-router'
</script>
<style scoped lang="scss">
.el-aside {
  box-shadow: 1px 0 12px 0 rgba(0, 0, 0, 0.1);
}
.el-header {
  box-shadow: 0 1px 12px 0 rgba(0, 0, 0, 0.1);
}
</style>