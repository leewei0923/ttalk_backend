import { PrimaryGeneratedColumn, Column, Entity } from 'typeorm';

@Entity()
export class offline_events_record {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_account: string;

  @Column()
  friend_account: string;

  @Column()
  event_type: string;

  @Column()
  create_time: string;

  @Column()
  update_time: string;

  @Column()
  end_flag: boolean;
}
