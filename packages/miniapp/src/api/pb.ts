import { API_BASE, request } from '../utils/request';

export interface PbListResult<T> {
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
  items: T[];
}

export interface PbRecord {
  id: string;
  collectionId: string;
  created: string;
  updated: string;
  [key: string]: unknown;
}

export function collectionPath(name: string, suffix = ''): string {
  return `/collections/${name}/records${suffix}`;
}

export async function pbAuthWithPassword(
  identity: string,
  password: string
): Promise<{ token: string; record: PbRecord }> {
  const res = await request<{ token: string; record: PbRecord }>({
    url: '/collections/users/auth-with-password',
    method: 'POST',
    data: { identity, password },
  });
  return res;
}

export async function pbAuthRefresh(): Promise<{ token: string; record: PbRecord }> {
  return request({
    url: '/collections/users/auth-refresh',
    method: 'POST',
  });
}

export async function pbList<T extends PbRecord>(
  collection: string,
  params?: { page?: number; perPage?: number; filter?: string; sort?: string; expand?: string }
): Promise<PbListResult<T>> {
  const q: string[] = [];
  if (params?.page) q.push(`page=${params.page}`);
  if (params?.perPage) q.push(`perPage=${params.perPage}`);
  if (params?.filter) q.push(`filter=${encodeURIComponent(params.filter)}`);
  if (params?.sort) q.push(`sort=${encodeURIComponent(params.sort)}`);
  if (params?.expand) q.push(`expand=${encodeURIComponent(params.expand)}`);
  const qs = q.length ? `?${q.join('&')}` : '';
  return request<PbListResult<T>>({
    url: `${collectionPath(collection)}${qs}`,
    method: 'GET',
  });
}

export async function pbGet<T extends PbRecord>(collection: string, id: string): Promise<T> {
  return request<T>({
    url: collectionPath(collection, `/${id}`),
    method: 'GET',
  });
}

export async function pbCreate<T extends PbRecord>(
  collection: string,
  body: Record<string, unknown>
): Promise<T> {
  return request<T>({
    url: collectionPath(collection),
    method: 'POST',
    data: body,
  });
}

export async function pbUpdate<T extends PbRecord>(
  collection: string,
  id: string,
  body: Record<string, unknown>
): Promise<T> {
  return request<T>({
    url: collectionPath(collection, `/${id}`),
    method: 'PATCH',
    data: body,
  });
}

/** Dev-only: direct health check */
export async function pbHealth(): Promise<{ message?: string; code?: number }> {
  const base = API_BASE.replace(/\/api\/?$/, '');
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${base}/api/health`,
      success: (res) => {
        if (res.statusCode === 200) resolve(res.data as { message?: string });
        else reject(res);
      },
      fail: reject,
    });
  });
}
