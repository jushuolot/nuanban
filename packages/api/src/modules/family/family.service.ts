import { Injectable } from '@nestjs/common';

@Injectable()
export class FamilyService {
  bindElder(_userId: string, body: { bindCode?: string; elderId?: string }) {
    return { ok: true, ...body };
  }

  listElders(_userId: string) {
    return { list: [] };
  }

  payOrder(_userId: string, orderId: string) {
    return { orderId, status: 'paid', message: '骨架：对接微信支付' };
  }

  approveOutdoor(_userId: string, orderId: string, approved: boolean) {
    return { orderId, approved };
  }
}
