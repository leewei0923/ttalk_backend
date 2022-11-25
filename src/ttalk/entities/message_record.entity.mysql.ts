import { PrimaryGeneratedColumn, Column, Entity } from 'typeorm';

@Entity()
export class message_record {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  message_id: string;

  @Column()
  user_account: string;

  @Column()
  friend_account: string;

  @Column()
  mood_state: string;

  @Column()
  message: string;

  @Column()
  create_time: string;

  @Column()
  message_style: string;

  @Column()
  read_flag: boolean;
}
