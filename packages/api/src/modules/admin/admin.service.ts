import { Injectable } from '@nestjs/common';

@Injectable()
export class AdminService {
  assignSchedule(body: Record<string, unknown>) {
    return { ok: true, source: 'admin_assign', ...body };
  }

  createExport(userId: string, body: { exportType: string; filters?: Record<string, unknown> }) {
    return {
      taskId: `exp_${Date.now()}`,
      createdBy: userId,
      status: 'pending',
      ...body,
    };
  }
}
