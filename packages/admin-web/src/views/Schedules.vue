<template>
  <el-card>
    <template #header>排班派单</template>
    <el-button type="primary" @click="assign">管理员派单（骨架）</el-button>
  </el-card>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus';
import { api } from '../api/client';

async function assign() {
  await api.post('/admin/schedules/assign', {
    elderId: '1',
    studentId: '1',
    serviceItemId: '1',
  });
  ElMessage.success('已提交');
}
</script>
