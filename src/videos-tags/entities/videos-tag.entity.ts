import {
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Tag } from 'src/tags/entities/tag.entity';
import { Video } from 'src/videos/entities/video.entity';

@Entity()
export class VideoTag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createAt: Date;

  @UpdateDateColumn()
  updateAt: Date;

  @DeleteDateColumn()
  deleteAt: Date;

  @ManyToOne(() => Video, (video) => video.videoTags, {
    onDelete: 'CASCADE',
  })
  video: Video;

  @ManyToOne(() => Tag, (tag) => tag.videoTags, {
    eager: true,
    onDelete: 'CASCADE',
  })
  tag: Tag;
}
