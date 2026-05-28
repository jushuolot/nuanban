<template>
  <view class="page">
    <text class="tip">待接单列表</text>
    <view v-for="o in list" :key="o.id" class="card" @tap="openRequest(o.id)">
      <text>订单 {{ o.id.slice(0, 8) }}</text>
      <text class="meta">老人 {{ o.elderId?.slice(0, 6) }} · ¥{{ ((o.amountCents || 0) / 100).toFixed(0) }}</text>
    </view>
    <view v-if="!list.length" class="empty">暂无待接单</view>
  </view>
</template>

<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app';
import { ref } from 'vue';
import { listPendingOrders, type PendingOrder } from '../../api/student';

const list = ref<PendingOrder[]>([]);

onShow(async () => {
  list.value = await listPendingOrders();
});

function openRequest(id: string) {
  uni.navigateTo({ url: `/package-student/order/request?id=${id}` });
}
</script>

<style scoped>
.page {
  padding: 24rpx;
}
.card {
  background: #fff;
  padding: 24rpx;
  margin-bottom: 16rpx;
  border-radius: 8rpx;
}
.meta {
  display: block;
  color: #666;
  font-size: 26rpx;
}
</style>
