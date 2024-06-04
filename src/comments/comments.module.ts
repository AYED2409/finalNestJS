import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { AuthModule } from 'src/auth/auth.module';
import { VideosModule } from 'src/videos/videos.module';
import { VideosService } from 'src/videos/videos.service';
import { UsersModule } from 'src/users/users.module';
import { CategoriesModule } from 'src/categories/categories.module';
import { UsersService } from 'src/users/users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment]),
    AuthModule,
    VideosModule,
    UsersModule,
    CategoriesModule,
  ],
  controllers: [CommentsController],
  providers: [CommentsService, VideosService, UsersService],
})
export class CommentsModule {}
