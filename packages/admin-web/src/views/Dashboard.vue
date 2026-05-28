<template>
  <el-row :gutter="16">
    <el-col :span="6"><el-statistic title="今日订单" :value="0" /></el-col>
    <el-col :span="6"><el-statistic title="待派单" :value="0" /></el-col>
    <el-col :span="6"><el-statistic title="待结算" :value="0" /></el-col>
    <el-col :span="6"><el-statistic title="在册学生" :value="0" /></el-col>
  </el-row>
</template>
