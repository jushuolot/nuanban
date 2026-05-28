import type { RoleKey } from '../config/tabs';
import { pbAuthWithPassword, type PbListResult, type PbRecord } from './pb';
import { request } from '../utils/request';

export interface AuthRole {
  role: RoleKey;
  status: string;
  elderProfileId?: string | null;
}

export interface LoginResult {
  token: string;
  user: { id: string; nickname?: string };
  roles: AuthRole[];
  activeRole?: RoleKey;
}

export async function loginWithWxCode(code: string): Promise<LoginResult> {
  return request<LoginResult>({
    url: '/nuanban/wx-login',
    method: 'POST',
    data: { code },
  });
}

/** 本地开发：走 hooks /dev-login，避免 H5 跨域或密码不一致 */
export async function loginDev(
  email = import.meta.env.VITE_DEV_AUTH_EMAIL || 'student1@test.nuanban.dev'
): Promise<LoginResult> {
  return request<LoginResult>({
    url: '/nuanban/dev-login',
    method: 'POST',
    data: { email },
  });
}

export async function fetchUserRoles(userId: string, token?: string): Promise<AuthRole[]> {
  const authHeader = token ? { Authorization: `Bearer ${token}` } : undefined;
  try {
    const res = await request<{ roles: AuthRole[] }>({
      url: '/nuanban/auth/me',
      method: 'GET',
      header: authHeader,
    });
    return res.roles;
  } catch {
    const list = await request<PbListResult<UserRoleRecord>>({
      url: `/collections/user_roles/records?filter=${encodeURIComponent(`user = "${userId}"`)}&perPage=20`,
      method: 'GET',
      header: authHeader,
    });
    return list.items.map((r) => ({
      role: r.role as RoleKey,
      status: r.status,
      elderProfileId: (r.elder_profile as string) || null,
    }));
  }
}

interface UserRoleRecord extends PbRecord {
  role: string;
  status: string;
  elder_profile?: string;
}

export async function registerRole(role: RoleKey, displayName?: string): Promise<AuthRole[]> {
  const res = await request<{ roles: AuthRole[] }>({
    url: '/nuanban/auth/register',
    method: 'POST',
    data: { role, displayName },
  });
  return res.roles;
}
