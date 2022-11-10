import { PrimaryGeneratedColumn, Column, Entity } from 'typeorm';

@Entity()
export class ttalk_user_concat {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  user_account: string;

  @Column()
  friend_account: string;

  @Column()
  add_time: string;

  @Column()
  update_time: string;

  @Column()
  friend_flag: boolean;

  @Column()
  verifyInformation: string;

  @Column()
  remark: string;

  @Column()
  blacklist: boolean;

  @Column()
  tags: string;

  @Column()
  ip: string;
}
