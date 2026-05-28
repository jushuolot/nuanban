import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../entities/user.entity';
import { UserRoleEntity } from '../../entities/user-role.entity';
import { UserWechatEntity } from '../../entities/user-wechat.entity';
import { WxLoginDto, RegisterDto, SwitchRoleDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity) private users: Repository<UserEntity>,
    @InjectRepository(UserRoleEntity) private userRoles: Repository<UserRoleEntity>,
    @InjectRepository(UserWechatEntity) private wechats: Repository<UserWechatEntity>,
    private jwt: JwtService,
  ) {}

  /** 开发环境：用 code 模拟 openid；生产对接微信 code2session */
  async wxLogin(dto: WxLoginDto) {
    const openid = `dev_${dto.code}`;
    let wx = await this.wechats.findOne({ where: { openid }, relations: ['user', 'user.roles'] });
    if (!wx) {
      const user = await this.users.save(this.users.create({ nickname: '微信用户' }));
      wx = await this.wechats.save(this.wechats.create({ userId: user.id, openid }));
      wx.user = user;
      wx.user.roles = [];
    }
    return this.buildAuthResponse(wx.user);
  }

  async register(userId: string, dto: RegisterDto) {
    const exists = await this.userRoles.findOne({
      where: { userId, role: dto.role },
    });
    if (exists) throw new UnauthorizedException('该角色已注册');
    await this.userRoles.save(
      this.userRoles.create({
        userId,
        role: dto.role,
        status: dto.role === 'student' ? 'pending' : 'active',
      }),
    );
    const user = await this.users.findOne({
      where: { id: userId },
      relations: ['roles'],
    });
    return this.buildAuthResponse(user!, dto.role);
  }

  async switchRole(userId: string, dto: SwitchRoleDto) {
    const role = await this.userRoles.findOne({
      where: { userId, role: dto.role, status: 'active' },
    });
    if (!role) throw new UnauthorizedException('无此有效角色');
    const user = await this.users.findOne({
      where: { id: userId },
      relations: ['roles'],
    });
    return this.buildAuthResponse(user!, dto.role);
  }

  async me(userId: string) {
    const user = await this.users.findOne({
      where: { id: userId },
      relations: ['roles'],
    });
    if (!user) throw new UnauthorizedException();
    return {
      user: { id: user.id, nickname: user.nickname, avatarUrl: user.avatarUrl },
      roles: user.roles.map((r) => ({ role: r.role, status: r.status })),
    };
  }

  private buildAuthResponse(user: UserEntity, activeRole?: string) {
    const roles = user.roles ?? [];
    const active =
      activeRole ??
      (roles.length === 1 ? roles[0].role : undefined);
    const token = this.jwt.sign({
      sub: user.id,
      roles: roles.map((r) => r.role),
      activeRole: active,
    });
    return {
      token,
      user: { id: user.id, nickname: user.nickname, avatarUrl: user.avatarUrl },
      roles: roles.map((r) => ({ role: r.role, status: r.status })),
      activeRole: active,
    };
  }
}
