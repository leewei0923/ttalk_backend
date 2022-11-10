import { PrimaryGeneratedColumn, Column, Entity } from 'typeorm';

@Entity()
export class ttalk_online {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  account: string;

  @Column()
  online_id: string;

  @Column()
  onlineFlag: boolean;

  @Column()
  add_time: string;

  @Column()
  update_time: string;
}
