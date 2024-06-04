import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserActiveInterface } from 'src/commons/interfaces/user-active.interface';
import { Comment } from './entities/comment.entity';
import { VideosService } from 'src/videos/videos.service';
import * as uuid from 'uuid';
import { UsersService } from 'src/users/users.service';
import { PaginationCommentDto } from './dto/pagination-comment.dto';
import { OrderBy } from './enums/orderBy-comment.enum';
import { PaginationUserCommentsDto } from './dto/pagination-userComments.dto';
import { OrderByUserComments } from './enums/orderBy-userComments.enum';
import { Role } from 'src/commons/enums/roles.enum';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    private readonly videoService: VideosService,
    private readonly userService: UsersService,
  ) {}

  async create(
    createCommentDto: CreateCommentDto,
    userActive: UserActiveInterface,
  ) {
    const video = await this.videoService.getOne(createCommentDto.idVideo);
    const user = await this.userService.findOne(userActive.id);
    const id = uuid.v4();
    return await this.commentRepository.save({
      id,
      text: createCommentDto.text,
      user,
      video,
    });
  }

  async findAll(pagination: PaginationCommentDto) {
    const { page, limit, order, orderBy } = pagination;
    const skip = (page - 1) * limit;
    const orderComments = this.getOrderByValueObject(orderBy, order);
    return await this.commentRepository.find({
      relations: ['user'],
      take: limit,
      skip: skip,
      order: orderComments,
    });
  }

  async findOne(id: string) {
    const comment = await this.commentRepository.findOneBy({ id });
    if (!comment) {
      throw new NotFoundException(`Comment with id: ${id} was not found`);
    }
    return comment;
  }

  async findAllOfVideo(idVideo: string, pagination: PaginationCommentDto) {
    await this.videoService.getOne(idVideo);
    const { page, limit, order, orderBy } = pagination;
    const skip = (page - 1) * limit;
    const orderValue = this.getValueOrderBy(orderBy);
    const comments = await this.commentRepository
      .createQueryBuilder('comment')
      .innerJoinAndSelect('comment.user', 'user')
      .where('comment.video = :idVideo', { idVideo })
      .skip(skip)
      .take(limit)
      .orderBy(orderValue, order)
      .getMany();
    return comments;
  }

  async findUserComments(
    idUser: string,
    pagination: PaginationUserCommentsDto,
  ) {
    await this.userService.findOne(idUser);
    const { page, limit, order, orderBy } = pagination;
    const skip = (page - 1) * limit;
    const orderValue = this.getValueOrderBy(orderBy);
    return await this.commentRepository
      .createQueryBuilder('comment')
      .innerJoinAndSelect('comment.video', 'video')
      .innerJoinAndSelect('video.category', 'category')
      .innerJoinAndSelect('video.user', 'user')
      .where('comment.user.id = :idUser', { idUser })
      .take(limit)
      .orderBy(orderValue, order)
      .skip(skip)
      .getMany();
  }

  async update(
    id: string,
    updateCommentDto: UpdateCommentDto,
    userActive: UserActiveInterface,
  ) {
    const comment = await this.isAuthorized(id, userActive);
    return await this.commentRepository.update(id, {
      text: updateCommentDto.text ? updateCommentDto.text : comment.text,
      video: updateCommentDto.idVideo
        ? await this.videoService.getOne(updateCommentDto.idVideo)
        : comment.video,
    });
  }

  async remove(id: string, userActive: UserActiveInterface) {
    await this.isAuthorized(id, userActive);
    return await this.commentRepository.softDelete(id);
  }

  async isAuthorized(id: string, userActive: UserActiveInterface) {
    const comment = await this.findOne(id);
    if (
      comment.user.email !== userActive.email &&
      userActive.role !== Role.ADMIN
    ) {
      throw new UnauthorizedException(
        'You do not have permission on the comment',
      );
    }
    return comment;
  }

  getValueOrderBy(orderBy: string) {
    let value;
    switch (orderBy) {
      case OrderBy.date:
        value = 'comment.createAt';
        break;
      case OrderBy.username:
        value = 'user.username';
        break;
      case OrderBy.id:
        value = 'comment.id';
        break;
      case OrderByUserComments.commentText:
        value = 'comment.text';
        break;
      default:
        value = 'comment.createAt';
    }
    return value;
  }

  getOrderByValueObject(orderBy: string, order: string) {
    let value;
    switch (orderBy) {
      case OrderBy.date:
        value = { createAt: order };
        break;
      case OrderBy.id:
        value = { id: order };
        break;
      case OrderBy.username:
        value = { user: { username: order } };
        break;
      default:
        value = { createAt: order };
    }
    return value;
  }
}
