<template>
  <view class="page">
    <button @tap="approve(true)">同意外出</button>
    <button @tap="approve(false)">拒绝</button>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { approveOutdoor } from '../../api/family';
import { pbErrorMessage } from '../../utils/request';

const orderId = ref('');
onLoad((q) => {
  if (q?.id) orderId.value = q.id as string;
});

async function approve(ok: boolean) {
  try {
    await approveOutdoor(orderId.value, ok);
    uni.navigateBack();
  } catch (e) {
    uni.showToast({ title: pbErrorMessage(e), icon: 'none' });
  }
}
</script>
