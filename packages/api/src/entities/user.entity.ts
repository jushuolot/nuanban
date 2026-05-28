import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserRoleEntity } from './user-role.entity';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ length: 20, nullable: true, unique: true })
  phone: string;

  @Column({ length: 64, nullable: true })
  nickname: string;

  @Column({ name: 'avatar_url', length: 512, nullable: true })
  avatarUrl: string;

  @Column({ length: 32, default: 'active' })
  status: string;

  @OneToMany(() => UserRoleEntity, (r) => r.user)
  roles: UserRoleEntity[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
