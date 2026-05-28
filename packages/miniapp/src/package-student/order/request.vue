<template>
  <view class="page">
    <button class="btn-ok" :loading="loading" @tap="accept">接受订单</button>
    <button class="btn-no" @tap="reject">拒绝</button>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { acceptOrder, rejectOrder } from '../../api/student';
import { pbErrorMessage } from '../../utils/request';

const id = ref('');
const loading = ref(false);

onLoad((q) => {
  if (q?.id) id.value = q.id as string;
});

async function accept() {
  loading.value = true;
  try {
    await acceptOrder(id.value);
    uni.showToast({ title: '已接单', icon: 'success' });
    uni.navigateBack();
  } catch (e) {
    uni.showToast({ title: pbErrorMessage(e), icon: 'none' });
  } finally {
    loading.value = false;
  }
}

async function reject() {
  try {
    await rejectOrder(id.value);
    uni.navigateBack();
  } catch (e) {
    uni.showToast({ title: pbErrorMessage(e), icon: 'none' });
  }
}
</script>

<style scoped>
.btn-ok {
  margin: 48rpx;
  background: #2e7d32;
  color: #fff;
}
.btn-no {
  margin: 0 48rpx;
  background: #eee;
}
</style>
