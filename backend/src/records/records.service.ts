import { Injectable, NotFoundException, OnApplicationBootstrap } from '@nestjs/common';
import { RecordsRepository } from './records.repository';
import { CreateRecordDto } from './dto/create-record.dto';
import { UpdateRecordDto } from './dto/update-record.dto';
import { QueryRecordsDto } from './dto/query-records.dto';
import { computeStatus } from './utils/compute-status.util';
import { LeaveRecord } from './entities/leave-record.entity';

const SEED_DATA: Partial<LeaveRecord>[] = [
  { name: 'AISHATU EGBEYEMI', irNo: '23951', rank: 'Officer II', leaveType: 'Leave of Absence', paidStatus: 'Unpaid', startDate: '2024-09-01', endDate: '2025-02-28', duration: '6 months', resumptionDate: '2025-03-01', reason: '' },
  { name: 'ADAMA MOMODU', irNo: '26508', rank: 'Assistant Manager', leaveType: 'Leave of Absence', paidStatus: 'Unpaid', startDate: '2023-09-01', endDate: '2025-10-31', duration: '24 Months', resumptionDate: '2025-09-01', reason: 'PUBLIC POLICY' },
  { name: 'ANULI UMEIKE N.', irNo: '19803', rank: 'Deputy Director', leaveType: 'Secondment', paidStatus: 'Unpaid', startDate: '2023-09-01', endDate: '2024-10-31', duration: '12 Months', resumptionDate: '2025-08-31', reason: 'Extension' },
  { name: 'MANAGER FUN-YEI', irNo: '27655', rank: 'Officer I', leaveType: 'Leave of Absence', paidStatus: 'Unpaid', startDate: '2023-09-01', endDate: '2025-08-31', duration: '24 Months', resumptionDate: '2025-09-01', reason: '' },
  { name: 'Zainab Ahmed Faouk', irNo: '27401', rank: 'Officer I', leaveType: 'Leave of Absence', paidStatus: 'Unpaid', startDate: '2025-03-01', endDate: '2025-08-31', duration: '6 months', resumptionDate: '2025-09-01', reason: 'Compassionate Grounds' },
  { name: 'PEARL ENEBELI', irNo: '25279', rank: 'Officer II', leaveType: 'Secondment', paidStatus: 'Unpaid', startDate: '2023-08-28', endDate: '2025-08-27', duration: '24 Months', resumptionDate: '2025-08-28', reason: 'PUBLIC POLICY' },
  { name: 'OSAGIE OBARISIAGBON', irNo: '21281', rank: 'Deputy Manager', leaveType: 'Study Leave', paidStatus: 'Unpaid', startDate: '2022-10-01', endDate: '2024-09-18', duration: '24 Months', resumptionDate: '2025-02-18', reason: '' },
];

@Injectable()
export class RecordsService implements OnApplicationBootstrap {
  constructor(private readonly repo: RecordsRepository) {}

  async onApplicationBootstrap() {
    const count = await this.repo.count();
    if (count === 0) {
      await this.repo.bulkInsert(SEED_DATA);
      console.log('Seeded database with initial leave records');
    }
  }

  private withStatus(record: LeaveRecord) {
    return { ...record, status: computeStatus(record) };
  }

  async findAll(query: QueryRecordsDto) {
    let records = await this.repo.findAll();

    if (query.search) {
      const q = query.search.toLowerCase();
      records = records.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.irNo.toLowerCase().includes(q) ||
          r.leaveType.toLowerCase().includes(q),
      );
    }

    if (query.leaveType) {
      records = records.filter((r) => r.leaveType === query.leaveType);
    }

    const withStatus = records.map((r) => this.withStatus(r));

    if (query.status) {
      const filtered = withStatus.filter((r) => r.status === query.status);
      return this.sort(filtered, query.sortBy, query.sortDir);
    }

    return this.sort(withStatus, query.sortBy, query.sortDir);
  }

  private sort(records: any[], sortBy = 'name', sortDir: 'asc' | 'desc' = 'asc') {
    return records.sort((a, b) => {
      const aVal = String(a[sortBy] ?? '').toLowerCase();
      const bVal = String(b[sortBy] ?? '').toLowerCase();
      const cmp = aVal.localeCompare(bVal);
      return sortDir === 'desc' ? -cmp : cmp;
    });
  }

  async findOne(id: number) {
    const record = await this.repo.findOne(id);
    if (!record) throw new NotFoundException(`Record ${id} not found`);
    return this.withStatus(record);
  }

  async create(dto: CreateRecordDto) {
    const record = await this.repo.create(dto);
    return this.withStatus(record);
  }

  async update(id: number, dto: UpdateRecordDto) {
    const record = await this.repo.update(id, dto);
    if (!record) throw new NotFoundException(`Record ${id} not found`);
    return this.withStatus(record);
  }

  async delete(id: number) {
    await this.findOne(id); // throws if not found
    await this.repo.delete(id);
  }

  async getAllRaw() {
    return this.repo.findAll();
  }

  async findByIrNoAndStartDate(irNo: string, startDate: string) {
    return this.repo.findByIrNoAndStartDate(irNo, startDate);
  }

  async bulkInsert(records: Partial<LeaveRecord>[]) {
    return this.repo.bulkInsert(records);
  }
}
