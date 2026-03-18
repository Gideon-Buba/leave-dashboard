import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeaveRecord } from './entities/leave-record.entity';
import { CreateRecordDto } from './dto/create-record.dto';
import { UpdateRecordDto } from './dto/update-record.dto';

@Injectable()
export class RecordsRepository {
  constructor(
    @InjectRepository(LeaveRecord)
    private readonly repo: Repository<LeaveRecord>,
  ) {}

  findAll(): Promise<LeaveRecord[]> {
    return this.repo.find();
  }

  findOne(id: number): Promise<LeaveRecord | null> {
    return this.repo.findOneBy({ id });
  }

  findByIrNoAndStartDate(irNo: string, startDate: string): Promise<LeaveRecord | null> {
    return this.repo.findOneBy({ irNo, startDate });
  }

  create(dto: CreateRecordDto): Promise<LeaveRecord> {
    const record = this.repo.create(dto);
    return this.repo.save(record);
  }

  async update(id: number, dto: UpdateRecordDto): Promise<LeaveRecord | null> {
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }

  count(): Promise<number> {
    return this.repo.count();
  }

  bulkInsert(records: Partial<LeaveRecord>[]): Promise<LeaveRecord[]> {
    const entities = this.repo.create(records);
    return this.repo.save(entities);
  }
}
