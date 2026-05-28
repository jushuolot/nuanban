import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('orders')
export class OrderEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'order_no', length: 32, unique: true })
  orderNo: string;

  @Column({ name: 'elder_id', type: 'bigint' })
  elderId: string;

  @Column({ name: 'student_id', type: 'bigint', nullable: true })
  studentId: string;

  @Column({ name: 'service_item_id', type: 'bigint' })
  serviceItemId: string;

  @Column({ name: 'order_source', length: 32 })
  orderSource: string;

  @Column({ name: 'initiator_user_id', type: 'bigint', nullable: true })
  initiatorUserId: string;

  @Column({ length: 32 })
  status: string;

  @Column({ name: 'payment_status', length: 32 })
  paymentStatus: string;

  @Column({ name: 'scheduled_start', type: 'timestamptz' })
  scheduledStart: Date;

  @Column({ name: 'amount_total_cents', type: 'bigint', default: 0 })
  amountTotalCents: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
