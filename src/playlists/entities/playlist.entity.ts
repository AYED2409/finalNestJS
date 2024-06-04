import { Playlist_Video } from 'src/playlists-videos/entities/playlists-video.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Playlist {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @ManyToOne(() => User, (user) => user.playlists, {
    eager: true,
    onDelete: 'CASCADE',
  })
  user: User;

  @ManyToMany(() => Playlist_Video, (playlist_video) => playlist_video.playlist)
  playlistVideos: Playlist_Video[];

  @CreateDateColumn()
  createAt: Date;

  @DeleteDateColumn()
  deleteAt: Date;
}
