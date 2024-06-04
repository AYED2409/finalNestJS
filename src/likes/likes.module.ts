import { Module } from '@nestjs/common';
import { LikesService } from './likes.service';
import { LikesController } from './likes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Like } from './entities/like.entity';
import { VideosModule } from 'src/videos/videos.module';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { VideosService } from 'src/videos/videos.service';
import { CategoriesModule } from 'src/categories/categories.module';
import { UsersService } from 'src/users/users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Like]),
    VideosModule,
    AuthModule,
    UsersModule,
    CategoriesModule,
  ],
  controllers: [LikesController],
  providers: [LikesService, VideosService, UsersService],
})
export class LikesModule {}
