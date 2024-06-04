import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateTagDto } from './dto/create-tag.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from './entities/tag.entity';
import * as uuid from 'uuid';
import { UserActiveInterface } from 'src/commons/interfaces/user-active.interface';
import { PaginationTag } from './dto/pagination-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { Role } from 'src/commons/enums/roles.enum';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
  ) {}

  async create(createTagDto: CreateTagDto) {
    await this.findOneByName(createTagDto.name);
    const id = uuid.v4();
    return await this.tagRepository.save({
      id,
      ...createTagDto,
    });
  }

  async findAll(pagination: PaginationTag) {
    const { order, limit, page } = pagination;
    const skip = (page - 1) * limit;
    return await this.tagRepository.find({
      order: { name: order },
      take: limit,
      skip: skip,
    });
  }

  async findOneByName(name: string) {
    const tag = await this.tagRepository.findOneBy({ name });
    if (tag) {
      throw new ConflictException('There is already a tag with that name');
    }
    return tag;
  }

  async findOne(id: string) {
    const tag = await this.tagRepository.findOneBy({ id });
    if (!tag) {
      throw new NotFoundException('The label does not exist');
    }
    return tag;
  }

  async update(
    id: string,
    updateTagDto: UpdateTagDto,
    userActive: UserActiveInterface,
  ) {
    await this.findOne(id);
    await this.findOneByName(updateTagDto.name);
    if (userActive.role === Role.ADMIN) {
      return this.tagRepository.update(id, {
        name: updateTagDto.name,
      });
    }
  }

  async remove(id: string, userActive: UserActiveInterface) {
    await this.findOne(id);
    if (userActive.role !== Role.ADMIN) {
      throw new UnauthorizedException(
        'You do not have permission to delete the tag',
      );
    }
    return await this.tagRepository.delete(id);
  }
}
