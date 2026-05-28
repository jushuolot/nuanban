<template>
  <view class="page">
    <text class="title">学生端</text>
    <view class="card" @tap="goRequests">待接单 {{ pending }}</view>
    <view class="card" @tap="goDiscover">附近老人</view>
    <RoleTabBar role="student" current="/package-student/home" />
  </view>
</template>

<script setup lang="ts">
import { ref, onShow } from 'vue';
import RoleTabBar from '../components/RoleTabBar.vue';
import { request } from '../utils/request';

const pending = ref(0);

onShow(async () => {
  try {
    const res = await request<{ list: unknown[] }>({
      url: '/student/order-requests',
      method: 'GET',
    });
    pending.value = res.list?.length ?? 0;
  } catch {
    pending.value = 0;
  }
});

function goRequests() {
  uni.navigateTo({ url: '/package-student/order/request' });
}
function goDiscover() {
  uni.navigateTo({ url: '/package-student/discover/list' });
}
</script>

<style scoped>
.page {
  padding: 32rpx;
  padding-bottom: 120rpx;
}
.card {
  background: #fff;
  padding: 32rpx;
  margin-top: 24rpx;
  border-radius: 12rpx;
}
</style>
