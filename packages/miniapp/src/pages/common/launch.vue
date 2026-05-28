<template>
  <view class="launch">
    <text class="title">暖伴勤工</text>
  </view>
</template>

<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app';
import { DEEP_LINK_MAP, ROLE_HOME, type RoleKey } from '../../config/tabs';
import { useRoleStore } from '../../store/role';

const roleStore = useRoleStore();

onLoad((query) => {
  const role = query?.role as RoleKey | undefined;
  const target = query?.target as string | undefined;
  const id = query?.id as string | undefined;

  setTimeout(() => {
    if (!roleStore.isLoggedIn) {
      uni.reLaunch({ url: '/pages/common/login' });
      return;
    }
    if (role) {
      roleStore.setActiveRole(role);
    }
    if (target && DEEP_LINK_MAP[target]) {
      const link = DEEP_LINK_MAP[target];
      roleStore.setActiveRole(link.role);
      uni.reLaunch({ url: link.path(id) });
      return;
    }
    if (roleStore.activeRole) {
      uni.reLaunch({ url: ROLE_HOME[roleStore.activeRole] });
      return;
    }
    if (roleStore.hasMultipleRoles) {
      uni.reLaunch({ url: '/pages/common/role-select' });
      return;
    }
    const r = roleStore.activeRoles[0]?.role;
    if (r) uni.reLaunch({ url: ROLE_HOME[r] });
    else uni.reLaunch({ url: '/pages/common/register' });
  }, 300);
});
</script>

<style scoped>
.launch {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: #fff8f0;
}
.title {
  font-size: 28px;
  font-weight: 600;
  color: #c45c26;
}
</style>
