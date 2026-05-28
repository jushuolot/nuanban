import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderEntity } from '../../entities/order.entity';
import { CreateElderOrderDto } from './elder.dto';

@Injectable()
export class ElderService {
  constructor(
    @InjectRepository(OrderEntity) private orders: Repository<OrderEntity>,
  ) {}

  nearbyCaregivers(_userId: string, query: { lat?: number; lng?: number; categoryId?: string }) {
    // TODO: 按距离 + school_cooperation + 指定老人 过滤学生
    return {
      list: [],
      query,
      message: '骨架接口：接入 students 表与距离计算',
    };
  }

  caregiverProfile(_userId: string, studentId: string) {
    return { studentId, message: '骨架：脱敏学生资料' };
  }

  async createOrder(userId: string, dto: CreateElderOrderDto) {
    const orderNo = `NB${Date.now()}`;
    const order = await this.orders.save(
      this.orders.create({
        orderNo,
        elderId: dto.elderId,
        studentId: dto.studentId,
        serviceItemId: dto.serviceItemId,
        orderSource: 'elder_self',
        initiatorUserId: userId,
        status: 'pending_payment',
        paymentStatus: 'unpaid',
        scheduledStart: new Date(dto.scheduledStart),
        amountTotalCents: '0',
      }),
    );
    return { order, next: 'notify_family_pay_or_wallet_deduct' };
  }

  listOrders(_userId: string) {
    return { list: [] };
  }

  confirmOrder(_userId: string, orderId: string) {
    return { orderId, status: 'pending_confirm' };
  }

  sos(_userId: string, elderId: string) {
    return { ok: true, elderId, message: '已通知紧急联系人与管理员' };
  }
}
