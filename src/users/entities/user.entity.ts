import { Comment } from 'src/comments/entities/comment.entity';
import { Like } from 'src/likes/entities/like.entity';
import { Playlist } from 'src/playlists/entities/playlist.entity';
import { Video } from 'src/videos/entities/video.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from 'src/commons/enums/roles.enum';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: false })
  email: string;

  @Column({ unique: true, nullable: false })
  username: string;

  @Column({ nullable: false, select: false })
  password: string;

  @Column({ type: 'enum', default: Role.USER, enum: Role })
  role: Role;

  @Column({ nullable: true })
  image: string;

  @CreateDateColumn()
  createAt: Date;

  @UpdateDateColumn()
  updateAt: Date;

  @DeleteDateColumn()
  deleteAt: Date;

  @OneToMany(() => Video, (video) => video.user, {
    onDelete: 'CASCADE',
    cascade: true,
  })
  videos: Video[];

  @OneToMany(() => Comment, (comment) => comment.user, {
    onDelete: 'CASCADE',
    cascade: true,
  })
  comments: Comment[];

  @OneToMany(() => Like, (like) => like.user, {
    onDelete: 'CASCADE',
    cascade: true,
  })
  likes: Like[];

  @ManyToMany(() => User, (user) => user.subscriptions)
  subscriptions: User[];

  @ManyToMany(() => User, (user) => user.subscribers)
  subscribers: User[];

  @OneToMany(() => Playlist, (playlist) => playlist.user, {
    onDelete: 'CASCADE',
    cascade: true,
  })
  playlists: Playlist[];
}
