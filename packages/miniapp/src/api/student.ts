import { request } from '../utils/request';
import { pbList, type PbRecord } from './pb';

export interface PendingOrder {
  id: string;
  elderId: string;
  amountCents?: number;
  scheduledAt?: string;
  status: string;
}

export async function listPendingOrders() {
  const res = await request<{ list: PendingOrder[] }>({
    url: '/nuanban/student/orders/pending',
    method: 'GET',
  });
  return res.list ?? [];
}

export async function acceptOrder(orderId: string) {
  return request<{ ok: boolean; status: string }>({
    url: `/nuanban/student/order-requests/${orderId}/accept`,
    method: 'POST',
  });
}

export async function rejectOrder(orderId: string, reason?: string) {
  return request<{ ok: boolean }>({
    url: `/nuanban/student/order-requests/${orderId}/reject`,
    method: 'POST',
    data: { reason: reason || '时间冲突' },
  });
}

export interface ElderRow extends PbRecord {
  name: string;
  latitude?: number;
  longitude?: number;
}

/** Nearby elders stub: active elders with coordinates */
export async function listNearbyElders(lat: number, lng: number, radiusKm = 5) {
  const res = await pbList<ElderRow>('elders', {
    filter: 'enabled = true',
    perPage: 50,
  });
  const R = 6371;
  return res.items
    .map((e) => {
      const elat = e.latitude as number | undefined;
      const elng = e.longitude as number | undefined;
      let km = 999;
      if (lat && lng && elat && elng) {
        const dLat = ((elat - lat) * Math.PI) / 180;
        const dLng = ((elng - lng) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) ** 2 +
          Math.cos((lat * Math.PI) / 180) *
            Math.cos((elat * Math.PI) / 180) *
            Math.sin(dLng / 2) ** 2;
        km = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      }
      return { ...e, distanceKm: km };
    })
    .filter((e) => e.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);
}
