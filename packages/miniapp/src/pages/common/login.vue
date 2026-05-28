<template>
  <view class="page">
    <text class="title">暖伴勤工</text>
    <text class="sub">一个小程序，服务老人、家属与同学</text>
    <button class="btn-primary" :loading="loading" @tap="onWxLogin">微信登录</button>
    <button class="btn-secondary" :loading="loading" @tap="onDevLogin">开发账号登录（学生）</button>
    <view class="hint">需先执行 seed-demo；账号见下方说明</view>
    <view class="links">
      <text @tap="goRegister('elder')">老人注册</text>
      <text @tap="goRegister('family')">家属注册</text>
      <text @tap="goRegister('student')">学生注册</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { loginDev, loginWithWxCode } from '../../api/auth';
import { ROLE_HOME, type RoleKey } from '../../config/tabs';
import { useRoleStore } from '../../store/role';
import { pbErrorMessage } from '../../utils/request';

const loading = ref(false);
const roleStore = useRoleStore();

function afterLogin(res: Awaited<ReturnType<typeof loginWithWxCode>>) {
  roleStore.setAuth({
    token: res.token,
    roles: res.roles,
    activeRole: res.activeRole,
    user: res.user,
  });
  if (!res.roles.length) {
    uni.navigateTo({ url: '/pages/common/register' });
    return;
  }
  const active = res.activeRole ?? res.roles.find((r) => r.status === 'active')?.role;
  if (active) {
    uni.reLaunch({ url: ROLE_HOME[active] });
  } else if (res.roles.filter((r) => r.status === 'active').length > 1) {
    uni.navigateTo({ url: '/pages/common/role-select' });
  } else {
    uni.navigateTo({ url: '/pages/common/register' });
  }
}

async function onWxLogin() {
  loading.value = true;
  try {
    const { code } = await new Promise<UniApp.LoginRes>((resolve, reject) => {
      uni.login({ provider: 'weixin', success: resolve, fail: reject });
    });
    const res = await loginWithWxCode(code);
    afterLogin(res);
  } catch (e) {
    uni.showToast({ title: pbErrorMessage(e), icon: 'none' });
  } finally {
    loading.value = false;
  }
}

async function onDevLogin() {
  loading.value = true;
  try {
    const res = await loginDev();
    afterLogin(res);
  } catch (e) {
    uni.showToast({ title: pbErrorMessage(e), icon: 'none' });
  } finally {
    loading.value = false;
  }
}

function goRegister(role: RoleKey) {
  uni.navigateTo({ url: `/pages/common/register?role=${role}` });
}
</script>

<style scoped>
.page {
  padding: 80rpx 48rpx;
}
.title {
  font-size: 48rpx;
  font-weight: 600;
  color: #c45c26;
}
.sub {
  display: block;
  margin: 16rpx 0 80rpx;
  color: #666;
}
.btn-primary {
  background: #c45c26;
  color: #fff;
  border-radius: 12rpx;
  margin-bottom: 24rpx;
}
.btn-secondary {
  background: #fff;
  color: #c45c26;
  border: 1px solid #c45c26;
  border-radius: 12rpx;
}
.hint {
  display: block;
  margin-top: 16rpx;
  font-size: 24rpx;
  color: #888;
  text-align: center;
}
.links {
  margin-top: 48rpx;
  display: flex;
  justify-content: space-between;
  color: #c45c26;
  font-size: 28rpx;
}
</style>
