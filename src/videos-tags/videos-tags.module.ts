import { Module, forwardRef } from '@nestjs/common';
import { VideosTagsService } from './videos-tags.service';
import { VideosTagsController } from './videos-tags.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VideoTag } from './entities/videos-tag.entity';
import { VideosModule } from 'src/videos/videos.module';
import { TagsModule } from 'src/tags/tags.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([VideoTag]),
    forwardRef(() => VideosModule),
    VideosModule,
    TagsModule,
    AuthModule,
  ],
  controllers: [VideosTagsController],
  providers: [VideosTagsService],
  exports: [TypeOrmModule],
})
export class VideosTagsModule {}
