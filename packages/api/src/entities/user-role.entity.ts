import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('user_roles')
export class UserRoleEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: string;

  @ManyToOne(() => UserEntity, (u) => u.roles)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ type: 'enum', enum: ['elder', 'family', 'student', 'org_admin', 'platform_admin'] })
  role: string;

  @Column({ type: 'enum', enum: ['pending', 'active', 'rejected', 'disabled'], default: 'pending' })
  status: string;

  @Column({ name: 'org_id', type: 'bigint', nullable: true })
  orgId: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
