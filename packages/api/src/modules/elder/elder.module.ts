import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEntity } from '../../entities/order.entity';
import { ElderController } from './elder.controller';
import { ElderService } from './elder.service';

@Module({
  imports: [TypeOrmModule.forFeature([OrderEntity])],
  controllers: [ElderController],
  providers: [ElderService],
})
export class ElderModule {}
