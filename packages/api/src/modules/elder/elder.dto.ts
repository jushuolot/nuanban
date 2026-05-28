import { IsISO8601, IsString } from 'class-validator';

export class CreateElderOrderDto {
  @IsString()
  elderId: string;

  @IsString()
  studentId: string;

  @IsString()
  serviceItemId: string;

  @IsISO8601()
  scheduledStart: string;
}
