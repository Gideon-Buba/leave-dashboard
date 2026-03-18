import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class LeaveRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  irNo: string;

  @Column({ nullable: true })
  rank: string;

  @Column()
  leaveType: string;

  @Column({ default: 'Unpaid' })
  paidStatus: string;

  @Column()
  startDate: string; // stored as TEXT YYYY-MM-DD

  @Column()
  endDate: string;

  @Column({ nullable: true })
  duration: string;

  @Column({ nullable: true })
  resumptionDate: string;

  @Column({ nullable: true })
  reason: string;

  @Column({ nullable: true })
  remark: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
