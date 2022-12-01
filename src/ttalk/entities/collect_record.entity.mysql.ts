import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class collect_record {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  collect_id: string;

  @Column()
  account: string;

  @Column()
  content: string;

  @Column()
  origin: string;

  @Column()
  type: string;

  @Column()
  create_time: string;

  @Column()
  update_time: string;
}
