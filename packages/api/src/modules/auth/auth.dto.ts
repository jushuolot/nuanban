import { IsIn, IsObject, IsOptional, IsString } from 'class-validator';

export class WxLoginDto {
  @IsString()
  code: string;
}

export class RegisterDto {
  @IsIn(['elder', 'family', 'student'])
  role: 'elder' | 'family' | 'student';

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsObject()
  profile?: Record<string, unknown>;
}

export class SwitchRoleDto {
  @IsIn(['elder', 'family', 'student'])
  role: 'elder' | 'family' | 'student';
}
