<template>
      <el-container>
        <el-aside width="200px"><Menu /></el-aside>
        <el-container>
          <el-header>Header</el-header>
          <el-main><RouterView /></el-main>
        </el-container>
      </el-container>
  </template>
  <script setup lang="ts">
import Menu from './components/menu.vue'
import { RouterView } from 'vue-router'
</script>