import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { UserActiveInterface } from 'src/commons/interfaces/user-active.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Playlist } from './entities/playlist.entity';
import { Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import * as uuid from 'uuid';
import { OrderBy } from './enums/orderBy-playlist.enum';
import { PaginantionPlaylistDto } from './dto/pagination-playlist.dto';

@Injectable()
export class PlaylistsService {
  constructor(
    @InjectRepository(Playlist)
    private readonly playlistRepository: Repository<Playlist>,
    private readonly userService: UsersService,
  ) {}

  async create(
    createPlaylistDto: CreatePlaylistDto,
    userActive: UserActiveInterface,
  ) {
    await this.findOneByNameForUser(createPlaylistDto.name, userActive);
    const user = await this.userService.findOne(userActive.id);
    const id = uuid.v4();
    return await this.playlistRepository.save({
      id,
      name: createPlaylistDto.name,
      user,
    });
  }

  async findAll(pagination: PaginantionPlaylistDto) {
    const { page, limit, order, orderBy } = pagination;
    const skip = (page - 1) * limit;
    const orderValue = this.getValueOrderByObject(orderBy, order);
    return await this.playlistRepository.find({
      take: limit,
      skip: skip,
      order: orderValue,
    });
  }

  async findUserPlaylist(userId: string, pagination: PaginantionPlaylistDto) {
    await this.userService.findOne(userId);
    const { page, limit, order, orderBy } = pagination;
    const orderValue = this.getValueOrderBy(orderBy);
    const skip = (page - 1) * limit;
    return await this.playlistRepository
      .createQueryBuilder('playlist')
      .where('playlist.user.id = :userId', { userId })
      .orderBy(orderValue, order)
      .take(limit)
      .skip(skip)
      .getMany();
  }

  async findOne(id: string) {
    const playlist = await this.playlistRepository.findOneBy({ id });
    if (!playlist) {
      throw new NotFoundException('non-existent playlist');
    }
    return playlist;
  }

  async findOneByNameForUser(name: string, userActive: UserActiveInterface) {
    const userId = userActive.id;
    const playlist = await this.playlistRepository
      .createQueryBuilder('playlist')
      .where('playlist.userId = :userId', { userId })
      .andWhere('playlist.name = :name', { name })
      .getOne();
    if (playlist) {
      throw new ConflictException(`Playlist with name: ${name} already exists`);
    }
    return playlist;
  }

  async update(
    id: string,
    createPlaylistDto: CreatePlaylistDto,
    userActive: UserActiveInterface,
  ) {
    if (await this.isAuthorized(id, userActive)) {
      const playlist = await this.findOne(id);
      if (playlist.name === createPlaylistDto.name) {
        throw new ConflictException(
          'You already have a playlist with that name',
        );
      }
      await this.findOneByNameForUser(createPlaylistDto.name, userActive);
      return await this.playlistRepository.update(id, {
        ...createPlaylistDto,
      });
    }
    throw new UnauthorizedException(
      'You are not authorized to edit this playlist',
    );
  }

  async isAuthorized(idPlaylist: string, userActive: UserActiveInterface) {
    await this.findOne(idPlaylist);
    const idUser = userActive.id;
    const playlist = await this.playlistRepository
      .createQueryBuilder('playlist')
      .where('playlist.id = :idPlaylist', { idPlaylist })
      .andWhere('playlist.user.id = :idUser', { idUser })
      .getOne();
    if (playlist) {
      return true;
    }
    return false;
  }

  async remove(id: string, userActive: UserActiveInterface) {
    if (await this.isAuthorized(id, userActive)) {
      return await this.playlistRepository.delete(id);
    }
    throw new UnauthorizedException(
      'You are not authorized to delete this playlist',
    );
  }

  getValueOrderBy(orderBy: string) {
    let value;
    switch (orderBy) {
      case OrderBy.creationDate:
        value = 'playlist.createAt';
        break;
      case OrderBy.id:
        value = 'playlist.id';
        break;
      case OrderBy.name:
        value = 'playlist.name';
        break;
      default:
        value = 'playlist.createAt';
    }
    return value;
  }

  getValueOrderByObject(orderBy: string, order: string) {
    let value;
    switch (orderBy) {
      case OrderBy.creationDate:
        value = { createAt: order };
        break;
      case OrderBy.id:
        value = { id: order };
        break;
      case OrderBy.name:
        value = { name: order };
        break;
      default:
        value = { createAt: order };
    }
    return value;
  }
}
