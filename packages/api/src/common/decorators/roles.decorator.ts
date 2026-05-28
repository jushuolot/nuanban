import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export type AppRole = 'elder' | 'family' | 'student' | 'org_admin' | 'platform_admin';

export const Roles = (...roles: AppRole[]) => SetMetadata(ROLES_KEY, roles);
