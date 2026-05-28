<template>
  <el-container class="layout">
    <el-aside width="220px">
      <div class="logo">暖伴勤工</div>
      <el-menu router :default-active="$route.path">
        <el-menu-item index="/dashboard">概览</el-menu-item>
        <el-menu-item index="/elders">老人档案</el-menu-item>
        <el-menu-item index="/schedules">排班派单</el-menu-item>
        <el-menu-item index="/school-cooperation">院校合作</el-menu-item>
        <el-menu-item index="/exports">导出中心</el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header>{{ title }}</el-header>
      <el-main><router-view /></el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const title = computed(() => (route.meta.title as string) || '管理后台');
</script>

<style scoped>
.layout {
  min-height: 100vh;
}
.logo {
  padding: 20px;
  font-weight: 600;
  color: #c45c26;
}
.el-header {
  background: #fff;
  line-height: 60px;
  border-bottom: 1px solid #eee;
}
</style>
