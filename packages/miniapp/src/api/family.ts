import { request } from '../utils/request';
import { pbCreate, pbList, type PbRecord } from './pb';

export async function payOrder(orderId: string) {
  return request<{ ok: boolean; status: string }>({
    url: `/nuanban/family/orders/${orderId}/pay`,
    method: 'POST',
  });
}

export async function approveOutdoor(orderId: string, approved: boolean, reason?: string) {
  return request<{ ok: boolean; approved: boolean }>({
    url: `/nuanban/family/outdoor/${orderId}/approve`,
    method: 'POST',
    data: { approved, reason },
  });
}

export async function bindElder(familyUserId: string, elderId: string, relationLabel?: string) {
  return pbCreate('family_elder_bindings', {
    family_user: familyUserId,
    elder: elderId,
    relation_label: relationLabel || '家属',
    is_primary_payer: true,
  });
}

export async function listBoundElders(familyUserId: string) {
  const bindings = await pbList<BindingRow>('family_elder_bindings', {
    filter: `family_user = "${familyUserId}"`,
    expand: 'elder',
    perPage: 20,
  });
  return bindings.items;
}

interface BindingRow extends PbRecord {
  elder: string;
  expand?: { elder?: { id: string; name: string } };
}

export async function listPendingPaymentOrders(elderIds: string[]) {
  if (!elderIds.length) return [];
  const filter = elderIds.map((id) => `elder = "${id}"`).join(' || ');
  const res = await pbList<OrderRow>('orders', {
    filter: `(${filter}) && status = "pending_payment"`,
    sort: '-created',
    perPage: 20,
  });
  return res.items;
}

interface OrderRow extends PbRecord {
  status: string;
  elder: string;
  amount_cents?: number;
}
