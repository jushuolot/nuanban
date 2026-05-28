import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { StudentService } from './student.service';

@Controller('student')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('student')
export class StudentController {
  constructor(private student: StudentService) {}

  @Get('elders/nearby')
  nearby(@Req() req: { user: { userId: string } }, @Query() query: Record<string, unknown>) {
    return this.student.nearbyElders(req.user.userId, query);
  }

  @Get('order-requests')
  requests(@Req() req: { user: { userId: string } }) {
    return this.student.orderRequests(req.user.userId);
  }

  @Post('order-requests/:id/accept')
  accept(@Req() req: { user: { userId: string } }, @Param('id') id: string) {
    return this.student.accept(req.user.userId, id);
  }

  @Post('order-requests/:id/reject')
  reject(
    @Req() req: { user: { userId: string } },
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ) {
    return this.student.reject(req.user.userId, id, reason);
  }
}
