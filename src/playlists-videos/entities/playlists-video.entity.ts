import { Playlist } from 'src/playlists/entities/playlist.entity';
import { Video } from 'src/videos/entities/video.entity';
import {
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Playlist_Video {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createAt: Date;

  @DeleteDateColumn()
  deleteAt: Date;

  @ManyToOne(() => Video, (video) => video.playlistVideos, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'videoId' })
  video: Video;

  @ManyToOne(() => Playlist, (playlist) => playlist.playlistVideos, {
    onDelete: 'CASCADE',
    cascade: true,
    eager: true,
  })
  @JoinColumn({ name: 'playlistId' })
  playlist: Playlist;
}
