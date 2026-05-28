<template>
  <view class="page elder-mode">
    <text v-if="order">订单 {{ order.id.slice(0, 8) }}</text>
    <text class="status">状态：{{ order?.status || '加载中' }}</text>
  </view>
</template>

<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app';
import { ref } from 'vue';
import { getOrder, type OrderRow } from '../../api/elder';
import { pbErrorMessage } from '../../utils/request';

const order = ref<OrderRow | null>(null);

onLoad(async (q) => {
  const id = q?.id as string;
  if (!id) return;
  try {
    order.value = await getOrder(id);
  } catch (e) {
    uni.showToast({ title: pbErrorMessage(e), icon: 'none' });
  }
});
</script>

<style scoped>
.page {
  padding: 48rpx;
}
.status {
  display: block;
  margin-top: 24rpx;
  color: #666;
}
</style>
