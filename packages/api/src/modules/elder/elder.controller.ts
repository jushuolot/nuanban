import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ElderService } from './elder.service';
import { CreateElderOrderDto } from './elder.dto';

@Controller('elder')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('elder')
export class ElderController {
  constructor(private elder: ElderService) {}

  @Get('caregivers/nearby')
  nearby(
    @Req() req: { user: { userId: string } },
    @Query() query: { lat?: number; lng?: number; categoryId?: string },
  ) {
    return this.elder.nearbyCaregivers(req.user.userId, query);
  }

  @Get('caregivers/:id')
  profile(@Req() req: { user: { userId: string } }, @Param('id') id: string) {
    return this.elder.caregiverProfile(req.user.userId, id);
  }

  @Post('orders')
  createOrder(@Req() req: { user: { userId: string } }, @Body() dto: CreateElderOrderDto) {
    return this.elder.createOrder(req.user.userId, dto);
  }

  @Get('orders')
  listOrders(@Req() req: { user: { userId: string } }) {
    return this.elder.listOrders(req.user.userId);
  }

  @Post('orders/:id/confirm')
  confirm(@Req() req: { user: { userId: string } }, @Param('id') id: string) {
    return this.elder.confirmOrder(req.user.userId, id);
  }

  @Post('sos')
  sos(@Req() req: { user: { userId: string } }, @Body('elderId') elderId: string) {
    return this.elder.sos(req.user.userId, elderId);
  }
}
