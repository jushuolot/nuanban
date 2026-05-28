<template>
  <el-card>
    <template #header>导出中心（替代监督端）</template>
    <el-form inline>
      <el-form-item label="类型">
        <el-select v-model="exportType" style="width: 200px">
          <el-option label="服务明细台账" value="service_ledger" />
          <el-option label="工时汇总" value="work_hours" />
          <el-option label="结算明细" value="settlement" />
        </el-select>
      </el-form-item>
      <el-form-item label="院校">
        <el-input v-model="schoolName" placeholder="筛选学生所属院校" clearable />
      </el-form-item>
      <el-button type="primary" @click="createExport">创建导出任务</el-button>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { api } from '../api/client';

const exportType = ref('service_ledger');
const schoolName = ref('');

async function createExport() {
  const { data } = await api.post('/admin/exports', {
    exportType: exportType.value,
    filters: { schoolName: schoolName.value || undefined },
  });
  ElMessage.success(`任务已创建：${data.taskId}`);
}
</script>
