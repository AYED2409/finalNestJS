import { Module } from '@nestjs/common';
import { PlaylistsService } from './playlists.service';
import { PlaylistsController } from './playlists.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Playlist } from './entities/playlist.entity';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { VideosModule } from 'src/videos/videos.module';
import { UsersController } from 'src/users/users.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Playlist]),
    AuthModule,
    UsersModule,
    VideosModule,
  ],
  controllers: [PlaylistsController, UsersController],
  providers: [PlaylistsService],
  exports: [PlaylistsService, TypeOrmModule],
})
export class PlaylistsModule {}
