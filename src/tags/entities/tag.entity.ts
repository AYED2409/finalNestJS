import { VideoTag } from 'src/videos-tags/entities/videos-tag.entity';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  DeleteDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

@Entity()
export class Tag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: false })
  name: string;

  @Column()
  @UpdateDateColumn()
  updateAt: Date;

  @Column()
  @DeleteDateColumn()
  deleteAt: Date;

  @OneToMany(() => VideoTag, (videoTag) => videoTag.tag, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  videoTags: VideoTag[];
}
