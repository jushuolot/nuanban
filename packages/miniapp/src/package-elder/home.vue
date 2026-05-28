<template>
  <view class="page elder-mode">
    <view class="hero">
      <text class="h1">您好</text>
      <text class="sub">今日有人陪伴您</text>
    </view>
    <view class="actions">
      <button class="big" @tap="goFind">找陪护</button>
      <button class="big outline" @tap="sos">一键求助</button>
    </view>
    <RoleTabBar role="elder" current="/package-elder/home" />
  </view>
</template>

<script setup lang="ts">
import RoleTabBar from '../components/RoleTabBar.vue';
import { onShow } from '@dcloudio/uni-app';
import { guardPackageRoute } from '../../utils/nav-guard';

onShow(() => guardPackageRoute('/package-elder/home'));

function goFind() {
  uni.navigateTo({ url: '/package-elder/caregivers/list' });
}
function sos() {
  uni.showToast({ title: '已发送求助', icon: 'none' });
}
</script>

<style scoped>
.page {
  padding: 32rpx;
  padding-bottom: 120rpx;
}
.hero .h1 {
  font-size: 44rpx;
  font-weight: 600;
}
.big {
  margin-top: 24rpx;
  font-size: 36rpx;
  background: #c45c26;
  color: #fff;
  border-radius: 16rpx;
}
.big.outline {
  background: #fff;
  color: #c45c26;
  border: 2rpx solid #c45c26;
}
</style>
