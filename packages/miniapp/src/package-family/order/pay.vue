<template>
  <view class="page">
    <text>订单 {{ orderId.slice(0, 8) }}</text>
    <button class="btn" :loading="loading" @tap="pay">模拟支付</button>
  </view>
</template>

<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app';
import { ref } from 'vue';
import { payOrder } from '../../api/family';
import { pbErrorMessage } from '../../utils/request';

const orderId = ref('');
const loading = ref(false);

onLoad((q) => {
  orderId.value = (q?.id as string) || '';
});

async function pay() {
  loading.value = true;
  try {
    await payOrder(orderId.value);
    uni.showToast({ title: '支付成功', icon: 'success' });
    uni.navigateBack();
  } catch (e) {
    uni.showToast({ title: pbErrorMessage(e), icon: 'none' });
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.page {
  padding: 48rpx;
}
.btn {
  margin-top: 48rpx;
  background: #c45c26;
  color: #fff;
}
</style>
