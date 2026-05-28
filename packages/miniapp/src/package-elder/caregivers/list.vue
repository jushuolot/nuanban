<template>
  <view class="page elder-mode">
    <text class="tip">按距离为您推荐附近同学</text>
    <view v-for="item in list" :key="item.id" class="card" @tap="goDetail(item)">
      <text class="name">{{ item.name }}</text>
      <text class="meta">{{ item.distance }} · {{ item.school }}</text>
    </view>
    <view v-if="!loading && !list.length" class="empty">暂无附近陪护，请稍后再试</view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getNearbyCaregivers, type CaregiverItem } from '../../api/elder';
import { pbErrorMessage } from '../../utils/request';

const list = ref<CaregiverItem[]>([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const loc = await new Promise<UniApp.GetLocationSuccess>((resolve, reject) => {
      uni.getLocation({ type: 'gcj02', success: resolve, fail: reject });
    });
    list.value = await getNearbyCaregivers(loc.latitude, loc.longitude);
  } catch (e) {
    list.value = await getNearbyCaregivers(31.2304, 121.4737);
    if (!list.value.length) {
      uni.showToast({ title: pbErrorMessage(e), icon: 'none' });
    }
  } finally {
    loading.value = false;
  }
});

function goDetail(item: CaregiverItem) {
  const studentUserId = item.userId || '';
  uni.navigateTo({
    url: `/package-elder/caregivers/detail?id=${item.id}&studentUserId=${studentUserId}`,
  });
}
</script>

<style scoped>
.page {
  padding: 24rpx;
}
.card {
  background: #fff;
  padding: 28rpx;
  margin-bottom: 20rpx;
  border-radius: 12rpx;
}
.name {
  font-size: 36rpx;
  font-weight: 600;
}
.meta {
  color: #666;
  font-size: 28rpx;
}
.empty {
  text-align: center;
  color: #999;
  margin-top: 80rpx;
}
</style>
