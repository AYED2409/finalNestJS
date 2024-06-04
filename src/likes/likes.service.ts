import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateLikeDto } from './dto/create-like.dto';
import { UserActiveInterface } from 'src/commons/interfaces/user-active.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Like } from './entities/like.entity';
import { Repository } from 'typeorm';
import { VideosService } from 'src/videos/videos.service';
import * as uuid from 'uuid';
import { UsersService } from 'src/users/users.service';
import { Video } from 'src/videos/entities/video.entity';
import { PaginationLikeDto } from './dto/pagination-like.dto';

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(Like)
    private readonly likeRepository: Repository<Like>,

    @InjectRepository(Video)
    private readonly videoRepository: Repository<Video>,
    private readonly videosServide: VideosService,
    private readonly usersServide: UsersService,
  ) {}

  async create(createLikeDto: CreateLikeDto, userActive: UserActiveInterface) {
    const video = await this.videosServide.getOne(createLikeDto.idVideo);
    if (await this.existMyLike(createLikeDto.idVideo, userActive.id)) {
      throw new ConflictException('ya le has dado like al video');
    }
    const user = await this.usersServide.findOne(userActive.id);
    const id = uuid.v4();
    await this.upLike(video);
    return await this.likeRepository.save({
      id,
      video,
      user,
    });
  }

  async findAll(pagination: PaginationLikeDto) {
    const { page, limit, order } = pagination;
    const skip = (page - 1) * limit;
    return await this.likeRepository.find({
      take: limit,
      order: { createAt: order },
      skip: skip,
    });
  }

  async findOne(id: string) {
    const like = await this.likeRepository.findOneBy({ id });
    if (!like) {
      throw new NotFoundException('The id of the entered like was not found');
    }
    return like;
  }

  async existMyLike(idVideo: string, idUser: string) {
    const likeVideo = await this.likeRepository
      .createQueryBuilder('like')
      .where('like.video = :idVideo', { idVideo })
      .andWhere('like.user = :idUser', { idUser })
      .getOne();
    if (likeVideo instanceof Like) {
      return true;
    }
    return false;
  }

  async remove(id: string, userActive: UserActiveInterface) {
    const like = await this.isAutorized(id, userActive);
    await this.downLike(like.video);
    return await this.likeRepository.softDelete(id);
  }

  async upLike(video: Video) {
    await this.videoRepository.update(video.id, {
      numLikes: video.numLikes + 1,
    });
    return video;
  }

  async downLike(video: Video) {
    return await this.videoRepository.update(video.id, {
      numLikes: video.numLikes - 1,
    });
  }

  async isAutorized(id: string, userActive: UserActiveInterface) {
    const like = await this.findOne(id);
    if (like.user.email !== userActive.email) {
      throw new UnauthorizedException(
        'You do not have permission on this like',
      );
    }
    return like;
  }

  async getLikesOfAVideo(idVideo: string, pagination: PaginationLikeDto) {
    await this.videosServide.getOne(idVideo);
    const { page, limit, order } = pagination;
    const skip = (page - 1) * limit;
    return await this.likeRepository.find({
      where: { video: { id: idVideo } },
      relations: ['user', 'video'],
      order: { createAt: order },
      skip: skip,
      take: limit,
    });
  }
}
