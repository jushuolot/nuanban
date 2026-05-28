<template>
  <view class="page">
    <text class="title">请选择使用身份</text>
    <view
      v-for="r in roleStore.activeRoles"
      :key="r.role"
      class="card"
      @tap="select(r.role)"
    >
      <text>{{ roleLabel[r.role] }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ROLE_HOME, type RoleKey } from '../../config/tabs';
import { useRoleStore } from '../../store/role';

const roleStore = useRoleStore();
const roleLabel: Record<RoleKey, string> = {
  elder: '我是老人',
  family: '我是家属',
  student: '我是学生',
};

async function select(role: RoleKey) {
  roleStore.setAuth({
    token: roleStore.token,
    roles: roleStore.roles,
    activeRole: role,
    user: roleStore.user ?? undefined,
  });
  uni.reLaunch({ url: ROLE_HOME[role] });
}
</script>

<style scoped>
.page {
  padding: 48rpx;
}
.title {
  font-size: 36rpx;
  margin-bottom: 32rpx;
}
.card {
  background: #fff;
  padding: 32rpx;
  margin-bottom: 24rpx;
  border-radius: 12rpx;
  font-size: 32rpx;
}
</style>
