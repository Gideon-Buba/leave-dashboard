import { Injectable } from '@nestjs/common';
import { RecordsService } from '../records/records.service';
import { computeStatus } from '../records/utils/compute-status.util';

@Injectable()
export class StatsService {
  constructor(private readonly recordsService: RecordsService) {}

  async getStats() {
    const records = await this.recordsService.getAllRaw();
    const stats = {
      total: records.length,
      overdue: 0,
      ongoing: 0,
      upcoming: 0,
      completed: 0,
      unpaid: 0,
    };

    for (const r of records) {
      const status = computeStatus(r);
      if (status === 'Overdue') stats.overdue++;
      else if (status === 'Ongoing') stats.ongoing++;
      else if (status === 'Upcoming') stats.upcoming++;
      else if (status === 'Completed') stats.completed++;

      if (r.paidStatus === 'Unpaid') stats.unpaid++;
    }

    return stats;
  }
}
