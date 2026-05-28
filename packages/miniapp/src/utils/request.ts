import { useRoleStore } from '../store/role';

/** PocketBase REST root, e.g. http://localhost:8090/api */
export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8090/api';

export interface PbErrorBody {
  message?: string;
  data?: Record<string, { message?: string }>;
}

export function pbErrorMessage(err: unknown): string {
  if (!err || typeof err !== 'object') return '请求失败';
  const body = err as PbErrorBody;
  if (body.message) return body.message;
  if (body.data) {
    const first = Object.values(body.data)[0];
    if (first?.message) return first.message;
  }
  return '请求失败';
}

export function request<T>(options: UniApp.RequestOptions): Promise<T> {
  const role = useRoleStore();
  const url = options.url.startsWith('http') ? options.url : `${API_BASE}${options.url}`;

  return new Promise((resolve, reject) => {
    uni.request({
      ...options,
      url,
      timeout: 15000,
      header: {
        'Content-Type': 'application/json',
        ...(options.header || {}),
        ...(role.token ? { Authorization: `Bearer ${role.token}` } : {}),
        ...(role.activeRole ? { 'X-Active-Role': role.activeRole } : {}),
      },
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data as T);
          return;
        }
        if (res.statusCode === 401) {
          role.logout();
          uni.reLaunch({ url: '/pages/common/login' });
          reject(new Error('未登录'));
          return;
        }
        reject(res.data ?? { message: `HTTP ${res.statusCode}` });
      },
      fail: (e) => reject(e),
    });
  });
}
