import { Module } from '@nestjs/common';
import { PlaylistsVideosService } from './playlists-videos.service';
import { PlaylistsVideosController } from './playlists-videos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Playlist_Video } from './entities/playlists-video.entity';
import { AuthModule } from 'src/auth/auth.module';
import { VideosModule } from 'src/videos/videos.module';
import { PlaylistsModule } from 'src/playlists/playlists.module';
import { VideosService } from 'src/videos/videos.service';
import { PlaylistsService } from 'src/playlists/playlists.service';
import { UsersModule } from 'src/users/users.module';
import { CategoriesModule } from 'src/categories/categories.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Playlist_Video]),
    AuthModule,
    VideosModule,
    PlaylistsModule,
    UsersModule,
    CategoriesModule,
  ],
  controllers: [PlaylistsVideosController],
  providers: [PlaylistsVideosService, PlaylistsService, VideosService],
})
export class PlaylistsVideosModule {}
