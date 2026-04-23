<template>
  <div class="dashboard">
    <el-row :gutter="10">
      <el-col :span="6">
        <TipCard :data="{ title: '本周新增', value: 12, icon: TrendCharts }" />
      </el-col>
      <el-col :span="6">
        <TipCard :data="{ title: '待复习', value: 8, icon: Clock }" />
      </el-col>
      <el-col :span="6">
        <TipCard :data="{ title: '正确率', value: '85%', icon: CircleCheck }" />
      </el-col>
      <el-col :span="6">
        <TipCard :data="{ title: '平均学习时间', value: '10分钟', icon: Clock }" />
      </el-col>
    </el-row>

    <el-row :gutter="10">
      <el-col :span="16">
        <LearningTrends />
      </el-col>
      <el-col :span="8">
        <MistakesClassify />
      </el-col>
    </el-row>

    <el-row :gutter="10" class="section-last">
      <el-col :span="24">
        <WeakPointsBar />
      </el-col>
    </el-row>
  </div>
</template>
<script setup lang="ts">
import TipCard from './components/tip-card.vue'
import LearningTrends from './components/learning-trends.vue'
import MistakesClassify from './components/mistakes-classify.vue'
import WeakPointsBar from './components/weak-points-bar.vue'
import { CircleCheck, Clock, TrendCharts } from '@element-plus/icons-vue'
</script>
<style scoped lang="scss">
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.section-last {
  margin-top: 5px;
}

</style>