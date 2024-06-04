import { Category } from 'src/categories/entities/category.entity';
import { Comment } from 'src/comments/entities/comment.entity';
import { Like } from 'src/likes/entities/like.entity';
import { Playlist_Video } from 'src/playlists-videos/entities/playlists-video.entity';
import { User } from 'src/users/entities/user.entity';
import { VideoTag } from 'src/videos-tags/entities/videos-tag.entity';
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  DeleteDateColumn,
  UpdateDateColumn,
  ManyToMany,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class Video {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  numLikes: number;

  @Column()
  filePath: string;

  @Column({ nullable: true })
  thumbnail: string;

  @CreateDateColumn()
  createAt: Date;

  @UpdateDateColumn()
  updateAt: Date;

  @DeleteDateColumn()
  deleteAt: Date;

  @ManyToOne(() => Category, (category) => category.id, { eager: true })
  category: Category;

  @ManyToOne(() => User, (user) => user.videos, {
    eager: true,
    onDelete: 'CASCADE',
  })
  user: User;

  @OneToMany(() => VideoTag, (videoTag) => videoTag.video, {
    eager: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  videoTags: VideoTag[];

  @OneToMany(() => Comment, (comment) => comment.video, {
    eager: true,
    onDelete: 'CASCADE',
    cascade: true,
  })
  comments: Comment[];

  @OneToMany(() => Like, (like) => like.video, {
    onDelete: 'CASCADE',
    cascade: true,
  })
  likes: Like[];

  @ManyToMany(() => Playlist_Video, (playlist_video) => playlist_video.video, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  playlistVideos: Playlist_Video[];
}
