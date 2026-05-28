<template>
  <view class="page">
    <text class="title">学生端</text>
    <view class="card" @tap="goRequests">待接单 {{ pending }}</view>
    <view class="card" @tap="goDiscover">附近老人</view>
    <view v-if="errorMsg" class="error" @tap="reload">
      <text>请求失败（点此重试）</text>
      <text class="mono">{{ errorMsg }}</text>
    </view>
    <RoleTabBar role="student" current="/package-student/home" />
  </view>
</template>

<script setup lang="ts">
import { ref, onShow } from 'vue';
import RoleTabBar from '../components/RoleTabBar.vue';
import { request } from '../utils/request';
import { pbErrorMessage } from '../utils/request';

const pending = ref(0);
const errorMsg = ref('');

async function reload() {
  errorMsg.value = '';
  try {
    const res = await request<{ list: unknown[] }>({
      url: '/nuanban/student/orders/pending',
      method: 'GET',
    });
    pending.value = res.list?.length ?? 0;
  } catch (e) {
    pending.value = 0;
    errorMsg.value = pbErrorMessage(e);
  }
}

onShow(reload);

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
.error {
  margin-top: 24rpx;
  padding: 24rpx;
  border-radius: 12rpx;
  background: #fff3f3;
  color: #b71c1c;
}
.mono {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  word-break: break-all;
}
</style>
