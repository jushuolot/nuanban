import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import { RegisterDto, SwitchRoleDto, WxLoginDto } from './auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('wx-login')
  wxLogin(@Body() dto: WxLoginDto) {
    return this.auth.wxLogin(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('register')
  register(@Req() req: { user: { userId: string } }, @Body() dto: RegisterDto) {
    return this.auth.register(req.user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('switch-role')
  switchRole(@Req() req: { user: { userId: string } }, @Body() dto: SwitchRoleDto) {
    return this.auth.switchRole(req.user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: { user: { userId: string } }) {
    return this.auth.me(req.user.userId);
  }
}
