<template>
  <view class="page elder-mode">
    <button class="btn-primary" @tap="goOrder">选择服务并预约</button>
  </view>
</template>

<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app';
import { ref } from 'vue';

const studentUserId = ref('');

onLoad((q) => {
  studentUserId.value = (q?.studentUserId as string) || '';
});

function goOrder() {
  uni.navigateTo({
    url: `/package-elder/order/create?studentUserId=${studentUserId.value}`,
  });
}
</script>

<style scoped>
.btn-primary {
  margin: 48rpx;
  background: #c45c26;
  color: #fff;
}
</style>
