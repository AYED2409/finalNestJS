import { User } from 'src/users/entities/user.entity';
import {
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createAt: Date;

  @UpdateDateColumn()
  updateAt: Date;

  @DeleteDateColumn()
  deleteAt: Date;

  @ManyToOne(() => User, (user) => user.subscribers, {
    eager: true,
    onDelete: 'CASCADE',
  })
  user: User; //usuario que recibe la suscripcion

  @ManyToOne(() => User, (user) => user.subscriptions, {
    eager: true,
    onDelete: 'CASCADE',
  })
  subscriber: User; //usuario que realiza la suscripcion
}
