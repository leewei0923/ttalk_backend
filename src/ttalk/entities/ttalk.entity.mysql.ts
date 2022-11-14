import { PrimaryGeneratedColumn, Column, Entity } from 'typeorm';

@Entity()
export class ttalk_user {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  openid: string;

  @Column()
  account: string;

  @Column()
  password: string;

  @Column()
  nickname: string;

  @Column()
  social: string;

  @Column()
  motto: string;

  @Column()
  salt: string;

  @Column()
  bird_date: string;

  @Column()
  add_time: string;

  @Column()
  avatar: string;

  @Column()
  ip: string;

  @Column()
  update_time: string; // 2022-11-14
}
