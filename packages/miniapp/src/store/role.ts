import { defineStore } from 'pinia';
import type { RoleKey } from '../config/tabs';
import type { AuthRole } from '../api/auth';

export type UserRole = AuthRole;

const TOKEN_KEY = 'access_token';
const ACTIVE_ROLE_KEY = 'activeRole';
const ROLES_KEY = 'roles';
const ELDER_PROFILE_KEY = 'elderProfileId';
const USER_KEY = 'user';

export const useRoleStore = defineStore('role', {
  state: () => ({
    token: uni.getStorageSync(TOKEN_KEY) as string,
    activeRole: (uni.getStorageSync(ACTIVE_ROLE_KEY) as RoleKey) || null,
    roles: (uni.getStorageSync(ROLES_KEY) as UserRole[]) || [],
    elderProfileId: (uni.getStorageSync(ELDER_PROFILE_KEY) as string) || null,
    user: (uni.getStorageSync(USER_KEY) as {
      id: string;
      nickname?: string;
      avatarUrl?: string;
    }) || null,
  }),
  getters: {
    isLoggedIn: (s) => !!s.token,
    activeRoles: (s) => s.roles.filter((r) => r.status === 'active'),
    hasMultipleRoles: (s) => s.roles.filter((r) => r.status === 'active').length > 1,
    currentElderId: (s) => {
      if (s.elderProfileId) return s.elderProfileId;
      const elderRole = s.roles.find((r) => r.role === 'elder' && r.status === 'active');
      return elderRole?.elderProfileId ?? null;
    },
  },
  actions: {
    setAuth(payload: {
      token: string;
      roles: UserRole[];
      activeRole?: RoleKey;
      user?: { id: string; nickname?: string; avatarUrl?: string };
    }) {
      this.token = payload.token;
      this.roles = payload.roles;
      this.user = payload.user ?? null;
      const elderRole = payload.roles.find((r) => r.role === 'elder' && r.elderProfileId);
      this.elderProfileId = elderRole?.elderProfileId ?? this.elderProfileId;

      if (payload.activeRole) {
        this.activeRole = payload.activeRole;
      } else if (payload.roles.filter((r) => r.status === 'active').length === 1) {
        this.activeRole = payload.roles.find((r) => r.status === 'active')!.role;
      }

      uni.setStorageSync(TOKEN_KEY, this.token);
      uni.setStorageSync(ROLES_KEY, this.roles);
      if (this.user) uni.setStorageSync(USER_KEY, this.user);
      if (this.activeRole) uni.setStorageSync(ACTIVE_ROLE_KEY, this.activeRole);
      if (this.elderProfileId) uni.setStorageSync(ELDER_PROFILE_KEY, this.elderProfileId);
    },
    setActiveRole(role: RoleKey) {
      this.activeRole = role;
      uni.setStorageSync(ACTIVE_ROLE_KEY, role);
      const elderRole = this.roles.find((r) => r.role === 'elder' && r.elderProfileId);
      if (role === 'elder' && elderRole?.elderProfileId) {
        this.elderProfileId = elderRole.elderProfileId;
        uni.setStorageSync(ELDER_PROFILE_KEY, this.elderProfileId);
      }
    },
    setElderProfileId(id: string) {
      this.elderProfileId = id;
      uni.setStorageSync(ELDER_PROFILE_KEY, id);
    },
    logout() {
      this.token = '';
      this.activeRole = null;
      this.roles = [];
      this.user = null;
      this.elderProfileId = null;
      uni.removeStorageSync(TOKEN_KEY);
      uni.removeStorageSync(ACTIVE_ROLE_KEY);
      uni.removeStorageSync(ROLES_KEY);
      uni.removeStorageSync(USER_KEY);
      uni.removeStorageSync(ELDER_PROFILE_KEY);
    },
  },
});
