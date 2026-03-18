import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaveRecord } from './entities/leave-record.entity';
import { RecordsController } from './records.controller';
import { RecordsService } from './records.service';
import { RecordsRepository } from './records.repository';

@Module({
  imports: [TypeOrmModule.forFeature([LeaveRecord])],
  controllers: [RecordsController],
  providers: [RecordsService, RecordsRepository],
  exports: [RecordsService],
})
export class RecordsModule {}
