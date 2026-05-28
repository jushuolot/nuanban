<template>
  <view class="page">
    <text class="title">注册 · {{ roleLabel[role] }}</text>
    <input v-model="displayName" class="input" placeholder="显示名称（可选）" />
    <button class="btn-primary" :loading="loading" @tap="submit">提交注册</button>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { loginDev, registerRole } from '../../api/auth';
import type { RoleKey } from '../../config/tabs';
import { useRoleStore } from '../../store/role';
import { pbErrorMessage } from '../../utils/request';

const role = ref<RoleKey>('student');
const displayName = ref('');
const loading = ref(false);
const roleStore = useRoleStore();
const roleLabel: Record<RoleKey, string> = {
  elder: '老人',
  family: '家属',
  student: '学生',
};

onLoad(async (q) => {
  if (q?.role) role.value = q.role as RoleKey;
  if (!roleStore.isLoggedIn) {
    try {
      const res = await loginDev();
      roleStore.setAuth({
        token: res.token,
        roles: res.roles,
        user: res.user,
      });
    } catch {
      uni.showToast({ title: '请先登录', icon: 'none' });
      uni.navigateTo({ url: '/pages/common/login' });
    }
  }
});

async function submit() {
  loading.value = true;
  try {
    const roles = await registerRole(role.value, displayName.value || undefined);
    roleStore.setAuth({
      token: roleStore.token,
      roles,
      user: roleStore.user ?? undefined,
      activeRole: role.value,
    });
    uni.showToast({ title: '已提交', icon: 'success' });
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
.input {
  margin: 24rpx 0;
  padding: 20rpx;
  border: 1px solid #ddd;
  border-radius: 8rpx;
}
.btn-primary {
  margin-top: 48rpx;
  background: #c45c26;
  color: #fff;
}
</style>
