<template>
  <view class="page elder-mode">
    <picker :range="items" range-key="label" @change="onPick">
      <view class="picker">服务：{{ selected?.label || '请选择' }}</view>
    </picker>
    <button class="btn-primary" :loading="loading" @tap="submit">提交预约</button>
  </view>
</template>

<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app';
import { computed, ref } from 'vue';
import { createOrder, listServiceItems } from '../../api/elder';
import { useRoleStore } from '../../store/role';
import { pbErrorMessage } from '../../utils/request';

const studentUserId = ref('');
const items = ref<{ id: string; label: string }[]>([]);
const picked = ref(0);
const loading = ref(false);
const roleStore = useRoleStore();

const selected = computed(() => items.value[picked.value]);

onLoad(async (q) => {
  studentUserId.value = (q?.studentUserId as string) || '';
  try {
    const rows = await listServiceItems();
    items.value = rows.map((r) => ({
      id: r.id,
      label: `${r.name} ¥${((r.price_cents || 0) / 100).toFixed(0)}`,
    }));
  } catch (e) {
    uni.showToast({ title: pbErrorMessage(e), icon: 'none' });
  }
});

function onPick(e: { detail: { value: string } }) {
  picked.value = Number(e.detail.value);
}

async function submit() {
  const elderId = roleStore.currentElderId;
  if (!elderId) {
    uni.showToast({ title: '未绑定老人档案', icon: 'none' });
    return;
  }
  if (!selected.value) {
    uni.showToast({ title: '请选择服务', icon: 'none' });
    return;
  }
  loading.value = true;
  try {
    const res = await createOrder({
      elderId,
      serviceItemId: selected.value.id,
      studentId: studentUserId.value || undefined,
      scheduledAt: new Date().toISOString(),
    });
    uni.showToast({ title: '已提交', icon: 'success' });
    uni.navigateTo({ url: `/package-elder/order/detail?id=${res.id}` });
  } catch (e) {
    uni.showToast({ title: pbErrorMessage(e), icon: 'none' });
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.picker {
  margin: 48rpx;
  padding: 24rpx;
  background: #fff;
  border-radius: 12rpx;
}
.btn-primary {
  margin: 48rpx;
  background: #c45c26;
  color: #fff;
}
</style>
