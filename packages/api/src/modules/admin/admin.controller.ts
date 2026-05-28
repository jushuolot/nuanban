import { Body, Controller, Post, Req } from '@nestjs/common';
import { AdminService } from './admin.service';

/** V1 骨架：生产环境需独立 Admin JWT + org/platform 角色守卫 */
@Controller('admin')
export class AdminController {
  constructor(private admin: AdminService) {}

  @Post('schedules/assign')
  assign(@Body() body: Record<string, unknown>) {
    return this.admin.assignSchedule(body);
  }

  @Post('exports')
  export(@Req() req: { user?: { userId: string } }, @Body() body: { exportType: string; filters?: Record<string, unknown> }) {
    return this.admin.createExport(req.user?.userId ?? '0', body);
  }
}
