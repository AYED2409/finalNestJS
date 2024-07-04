import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { VideosModule } from './videos/videos.module';
import { CategoriesModule } from './categories/categories.module';
import { TagsModule } from './tags/tags.module';
import { VideosTagsModule } from './videos-tags/videos-tags.module';
import { CommentsModule } from './comments/comments.module';
import { LikesModule } from './likes/likes.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { PlaylistsModule } from './playlists/playlists.module';
import { PlaylistsVideosModule } from './playlists-videos/playlists-videos.module';
import { ChatModule } from './chat/chat.module';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';

@Module({
  imports: [
    //importaciones para chat con websocket, chat desde carpeta public
    ChatModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    //permite acceder a las variables de entorno de forma GLOBAL
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    //configuracion para la integracion con la base de datos
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: parseInt(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USERNAME,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DATABASE,
      autoLoadEntities: true,
      synchronize: true,
      ssl: process.env.POSTGRES_SSL == 'true',
      extra: {
        ssl:
          process.env.POSTGRES_SSL == 'true'
            ? {
                rejectUnauthorized: false,
              }
            : null,
      },
    }),
    //modulos creados importados
    UsersModule,
    AuthModule,
    VideosModule,
    CategoriesModule,
    TagsModule,
    VideosTagsModule,
    CommentsModule,
    LikesModule,
    SubscriptionsModule,
    PlaylistsModule,
    PlaylistsVideosModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
