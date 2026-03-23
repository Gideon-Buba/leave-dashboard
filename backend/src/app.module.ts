import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaveRecord } from './records/entities/leave-record.entity';
import { RecordsModule } from './records/records.module';
import { ImportExportModule } from './import-export/import-export.module';
import { StatsModule } from './stats/stats.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: process.env.DB_PATH ?? 'data/leave.db',
      entities: [LeaveRecord],
      synchronize: true,
    }),
    RecordsModule,
    ImportExportModule,
    StatsModule,
  ],
})
export class AppModule {}
