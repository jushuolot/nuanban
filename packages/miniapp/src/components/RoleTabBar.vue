<template>
  <view class="tabbar">
    <view
      v-for="tab in tabs"
      :key="tab.pagePath"
      class="item"
      :class="{ active: current === tab.pagePath }"
      @tap="go(tab.pagePath)"
    >
      <text>{{ tab.text }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ROLE_TABS, type RoleKey } from '../config/tabs';

const props = defineProps<{ role: RoleKey; current: string }>();
const tabs = computed(() => ROLE_TABS[props.role]);

function go(url: string) {
  if (url === props.current) return;
  uni.redirectTo({ url });
}
</script>

<style scoped>
.tabbar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  background: #fff;
  border-top: 1rpx solid #eee;
  padding-bottom: env(safe-area-inset-bottom);
}
.item {
  flex: 1;
  text-align: center;
  padding: 20rpx 0;
  font-size: 26rpx;
  color: #666;
}
.item.active {
  color: #c45c26;
  font-weight: 600;
}
</style>
