import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  DeleteDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  @UpdateDateColumn()
  updateAt: Date;

  @Column()
  @DeleteDateColumn()
  deleteAt: Date;
}
