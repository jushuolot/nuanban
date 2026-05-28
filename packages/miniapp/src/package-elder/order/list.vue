<template>
  <view class="page elder-mode">
    <view v-for="o in orders" :key="o.id" class="card" @tap="goDetail(o.id)">
      <text>{{ o.id.slice(0, 8) }} · {{ o.status }}</text>
    </view>
    <view v-if="!orders.length" class="empty">暂无订单</view>
  </view>
</template>

<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app';
import { ref } from 'vue';
import { listOrdersForElder, type OrderRow } from '../../api/elder';
import { useRoleStore } from '../../store/role';

const orders = ref<OrderRow[]>([]);
const roleStore = useRoleStore();

onShow(async () => {
  const elderId = roleStore.currentElderId;
  if (!elderId) return;
  orders.value = await listOrdersForElder(elderId);
});

function goDetail(id: string) {
  uni.navigateTo({ url: `/package-elder/order/detail?id=${id}` });
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
</style>
