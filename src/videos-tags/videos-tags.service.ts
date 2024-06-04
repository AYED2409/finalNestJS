import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateVideoTagDto } from './dto/create-video-tag.dto';
import { UpdateVideoTagDto } from './dto/update-video-tag.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { VideoTag } from './entities/videos-tag.entity';
import { Repository } from 'typeorm';
import * as uuid from 'uuid';
import { UserActiveInterface } from 'src/commons/interfaces/user-active.interface';
import { VideosService } from 'src/videos/videos.service';
import { TagsService } from 'src/tags/tags.service';
import { PaginationVideosTagsDto } from './dto/pagination-videoTag.dto';
import { OrderBy } from './enums/orderBy-videosTags.enum';
import { OrderByVideosWithTag } from './enums/orderBy-videosWithTag.enum';
import { PaginationVideosWithTagDto } from './dto/pagination-videosWithTag.dto';
import { Role } from 'src/commons/enums/roles.enum';

@Injectable()
export class VideosTagsService {
  constructor(
    @InjectRepository(VideoTag)
    private videoTagResository: Repository<VideoTag>,
    private readonly videoService: VideosService,
    private readonly tagService: TagsService,
  ) {}

  async create(
    createVideosTagDto: CreateVideoTagDto,
    userActive: UserActiveInterface,
  ) {
    const video = await this.videoService.getOne(createVideosTagDto.idVideo);
    await this.isAuthorizedUser(userActive, video.id);
    const tag = await this.tagService.findOne(createVideosTagDto.idTag);
    const tagId = tag.id;
    const videoId = video.id;
    await this.searchTagAndVideoInVideoTag(tagId, videoId);
    const id = uuid.v4();
    return await this.videoTagResository.save({
      id,
      video,
      tag,
    });
  }

  async searchTagAndVideoInVideoTag(tagId: string, videoId: string) {
    const searchTag = await this.videoTagResository
      .createQueryBuilder('videoTag')
      .where('videoTag.tag = :tagId', { tagId })
      .andWhere('videoTag.video = :videoId', { videoId })
      .getMany();
    if (searchTag.length > 0) {
      throw new ConflictException('That tag is already assigned to that video');
    }
    return searchTag;
  }

  async findAll(pagination: PaginationVideosTagsDto) {
    const { page, limit, order, orderBy } = pagination;
    const orderValue = this.getValueOrderBy0bject(orderBy, order);
    const skip = (page - 1) * limit;
    return await this.videoTagResository.find({
      relations: ['video', 'tag'],
      take: limit,
      skip: skip,
      order: orderValue,
    });
  }

  async findTagsOfAVideo(idVideo: string, pagination: PaginationVideosTagsDto) {
    await this.videoService.getOne(idVideo);
    const { page, limit, order, orderBy } = pagination;
    const skip = (page - 1) * limit;
    const orderValue = this.getValueOrderBy(orderBy);
    return await this.videoTagResository
      .createQueryBuilder('video_tag')
      .innerJoinAndSelect('video_tag.tag', 'tag')
      .where('video_tag.video = :idVideo', { idVideo })
      .orderBy(orderValue, order)
      .take(limit)
      .skip(skip)
      .getMany();
  }

  async findVideosWithTag(
    idTag: string,
    pagination: PaginationVideosWithTagDto,
  ) {
    await this.tagService.findOne(idTag);
    const { page, limit, order, orderBy } = pagination;
    const orderValue = this.getValueOrderBy(orderBy);
    const skip = (page - 1) * limit;
    return await this.videoTagResository
      .createQueryBuilder('video_tag')
      .innerJoinAndSelect('video_tag.video', 'video')
      .innerJoinAndSelect('video.user', 'user')
      .leftJoinAndSelect('video.category', 'category')
      .leftJoinAndSelect('video.comments', 'comment')
      .where('video_tag.tag.id = :idTag', { idTag })
      .orderBy(orderValue, order)
      .take(limit)
      .skip(skip)
      .getMany();
  }

  async findOne(id: string) {
    const videoTag = await this.videoTagResository
      .createQueryBuilder('videoTag')
      .innerJoinAndSelect('videoTag.video', 'video')
      .leftJoinAndSelect('video.category', 'category')
      .innerJoinAndSelect('video.user', 'user')
      .leftJoinAndSelect('video.comments', 'comment')
      .innerJoinAndSelect('videoTag.tag', 'tag')
      .where('videoTag.id = :id', { id })
      .getOne();
    // const videoTag = await this.videoTagResository.findOneBy({ id });
    if (!videoTag) {
      throw new NotFoundException('Non-existent VideoTag ID');
    }
    return videoTag;
  }

  async update(
    id: string,
    updateVideosTagDto: UpdateVideoTagDto,
    userActive: UserActiveInterface,
  ) {
    const videoTag = await this.findOne(id);
    await this.isAuthorizedUser(userActive, videoTag.video.id);
    return await this.videoTagResository.update(id, {
      video: updateVideosTagDto.idVideo
        ? await this.isAuthorizedUser(userActive, updateVideosTagDto.idVideo)
        : videoTag.video,
      tag:
        updateVideosTagDto.idTag &&
        (
          await this.searchTagAndVideoInVideoTag(
            updateVideosTagDto.idTag,
            updateVideosTagDto.idVideo,
          )
        ).length == 0
          ? await this.tagService.findOne(updateVideosTagDto.idTag)
          : videoTag.tag,
    });
  }

  async remove(id: string, userActive: UserActiveInterface) {
    const videoTag = await this.findOne(id);
    await this.isAuthorizedUser(userActive, videoTag.video.id);
    return await this.videoTagResository.softDelete(id);
  }

  async removeAllTagsFromVideo(
    idVideo: string,
    userActive: UserActiveInterface,
  ) {
    await this.videoService.getOne(idVideo);
    await this.isAuthorizedUser(userActive, idVideo);
    return await this.videoTagResository
      .createQueryBuilder('video_tag')
      .delete()
      .from('video_tag')
      .where('video.id = :idVideo', { idVideo })
      .execute();
  }

  async isAuthorizedUser(userActive: UserActiveInterface, idVideo: string) {
    const video = await this.videoService.getOne(idVideo);
    if (
      userActive.email === video.user.email ||
      userActive.role === Role.ADMIN
    ) {
      return video;
    }
    throw new UnauthorizedException('Unauthorized user on the Video');
  }

  getValueOrderBy(orderBy: string) {
    let value;
    switch (orderBy) {
      case OrderBy.dateAdd:
        value = 'video_tag.createAt';
        break;
      case OrderBy.tagName:
        value = 'tag.name';
        break;
      case OrderByVideosWithTag.id:
        value = 'video_tag.id';
        break;
      case OrderByVideosWithTag.dateOfAssignment:
        value = 'video_tag.createAt';
        break;
      case OrderByVideosWithTag.videoTitle:
        value = 'video.title';
        break;
      default:
        value = 'video_tag.createAt';
    }
    return value;
  }

  getValueOrderBy0bject(orderBy: string, order: string) {
    let value;
    switch (orderBy) {
      case OrderBy.tagName:
        value = { tag: { name: order } };
        break;
      case OrderBy.dateAdd:
        value = { createAt: order };
        break;
      case OrderBy.videoTitle:
        value = { video: { title: order } };
        break;
      default:
        value = { tag: { name: order } };
    }
    return value;
  }
}
