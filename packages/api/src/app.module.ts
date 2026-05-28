import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { ElderModule } from './modules/elder/elder.module';
import { FamilyModule } from './modules/family/family.module';
import { StudentModule } from './modules/student/student.module';
import { AdminModule } from './modules/admin/admin.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: false,
        logging: config.get('NODE_ENV') === 'development',
      }),
    }),
    AuthModule,
    ElderModule,
    FamilyModule,
    StudentModule,
    AdminModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
