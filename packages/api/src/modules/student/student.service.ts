import { Injectable } from '@nestjs/common';

@Injectable()
export class StudentService {
  nearbyElders(_userId: string, query: Record<string, unknown>) {
    return { list: [], query };
  }

  orderRequests(_userId: string) {
    return { list: [] };
  }

  accept(_userId: string, id: string) {
    return { id, status: 'pending_service' };
  }

  reject(_userId: string, id: string, reason?: string) {
    return { id, status: 'cancelled', reason };
  }
}
