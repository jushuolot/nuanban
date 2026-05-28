import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { FamilyService } from './family.service';

@Controller('family')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('family')
export class FamilyController {
  constructor(private family: FamilyService) {}

  @Post('elders/bind')
  bind(@Req() req: { user: { userId: string } }, @Body() body: { bindCode?: string; elderId?: string }) {
    return this.family.bindElder(req.user.userId, body);
  }

  @Get('elders')
  elders(@Req() req: { user: { userId: string } }) {
    return this.family.listElders(req.user.userId);
  }

  @Post('orders/:id/pay')
  pay(@Req() req: { user: { userId: string } }, @Param('id') id: string) {
    return this.family.payOrder(req.user.userId, id);
  }

  @Post('outdoor/:orderId/approve')
  outdoor(
    @Req() req: { user: { userId: string } },
    @Param('orderId') orderId: string,
    @Body('approved') approved: boolean,
  ) {
    return this.family.approveOutdoor(req.user.userId, orderId, approved);
  }
}
