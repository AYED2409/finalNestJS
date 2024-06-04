import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreatePlaylistsVideoDto } from './dto/create-playlists-video.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Playlist_Video } from './entities/playlists-video.entity';
import { Repository } from 'typeorm';
import { VideosService } from 'src/videos/videos.service';
import { PlaylistsService } from 'src/playlists/playlists.service';
import * as uuid from 'uuid';
import { UserActiveInterface } from 'src/commons/interfaces/user-active.interface';
import { PaginationPlaylistVideo } from './dto/pagination-playlist-video.dto';
import { OrderBy } from './enums/orderBy-playlist-video.enum';

@Injectable()
export class PlaylistsVideosService {
  constructor(
    @InjectRepository(Playlist_Video)
    private readonly playlistVideoRepository: Repository<Playlist_Video>,
    private readonly videoService: VideosService,
    private readonly playlistService: PlaylistsService,
  ) {}

  async create(
    createPlaylistsVideoDto: CreatePlaylistsVideoDto,
    userActive: UserActiveInterface,
  ) {
    await this.playlistService.findOne(createPlaylistsVideoDto.idPlaylist);
    if (
      await this.playlistService.isAuthorized(
        createPlaylistsVideoDto.idPlaylist,
        userActive,
      )
    ) {
      const playlist = await this.playlistService.findOne(
        createPlaylistsVideoDto.idPlaylist,
      );
      const video = await this.videoService.getOne(
        createPlaylistsVideoDto.idVideo,
      );
      const id = uuid.v4();
      return await this.playlistVideoRepository.save({
        id,
        video,
        playlist,
      });
    }
    throw new UnauthorizedException(
      'The indicated playlist does not belong to you',
    );
  }

  async findAll(pagination: PaginationPlaylistVideo) {
    const { page, limit, order, orderBy } = pagination;
    const skip = (page - 1) * limit;
    const orderValue = this.getValueOrderByObject(orderBy, order);
    return await this.playlistVideoRepository.find({
      relations: ['video'],
      take: limit,
      skip: skip,
      order: orderValue,
    });
  }

  async findOne(id: string) {
    const playlistVideo = await this.playlistVideoRepository.findOneBy({ id });
    if (!playlistVideo) {
      throw new NotFoundException('The playlist-video was not found');
    }
    return playlistVideo;
  }

  async findVideosOfAPlaylist(
    idPlaylist: string,
    pagination: PaginationPlaylistVideo,
  ) {
    await this.playlistService.findOne(idPlaylist);
    const { page, limit, order, orderBy } = pagination;
    const skip = (page - 1) * limit;
    const orderValue = this.getValueOrderBy(orderBy);
    return await this.playlistVideoRepository
      .createQueryBuilder('playlist_video')
      .innerJoinAndSelect('playlist_video.video', 'video')
      .innerJoinAndSelect('video.category', 'category')
      .innerJoinAndSelect('video.user', 'user')
      .where('playlist_video.playlist = :idPlaylist', { idPlaylist })
      .orderBy(orderValue, order)
      .take(limit)
      .skip(skip)
      .getMany();
  }

  async remove(id: string, userActive: UserActiveInterface) {
    const playlistVideo = await this.findOne(id);
    const playId = playlistVideo.playlist.id;
    if (!(await this.playlistService.isAuthorized(playId, userActive))) {
      throw new UnauthorizedException(
        'You are not authorized to Delete this playlist-videos',
      );
    }
    return await this.playlistVideoRepository.softDelete(id);
  }

  getValueOrderBy(orderBy: string) {
    let value;
    switch (orderBy) {
      case OrderBy.dateAdded:
        value = 'playlist_video.createAt';
        break;
      case OrderBy.videoDate:
        value = 'video.createAt';
        break;
      case OrderBy.videoTitle:
        value = 'video.title';
        break;
      default:
        value = 'playlist_video.createAt';
    }
    return value;
  }
  getValueOrderByObject(orderBy: string, order: string) {
    let value;
    switch (orderBy) {
      case OrderBy.dateAdded:
        value = { createAt: order };
        break;
      case OrderBy.videoDate:
        value = { video: { createAt: order } };
        break;
      case OrderBy.videoTitle:
        value = { video: { title: order } };
        break;
      default:
        value = { createAt: order };
    }
    return value;
  }
}
