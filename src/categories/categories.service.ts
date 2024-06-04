import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as uuid from 'uuid';
import { PaginationCategoryDto } from './dto/pagination-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const category = await this.findOneByName(createCategoryDto.name);
    if (category) {
      throw new ConflictException('already existing category');
    }
    const id = uuid.v4();
    return await this.categoryRepository.save({
      id,
      ...createCategoryDto,
    });
  }

  async findOneByName(name: string) {
    const category = await this.categoryRepository.findOneBy({
      name: name,
    });
    // if (!category) {
    //   throw new NotFoundException(
    //     `No se encontro la categoria con nombre ${name}`,
    //   );
    // }
    return category;
  }
  async existCategoryByName(name: string) {
    const category = await this.findOneByName(name);
    if (!category) {
      throw new NotFoundException(
        `The category with name ${name} was not found`,
      );
    }
    return category;
  }

  async findAll(pagination: PaginationCategoryDto) {
    const { page, limit, order } = pagination;
    const skip = (page - 1) * limit;
    return await this.categoryRepository.find({
      order: { name: order },
      take: limit,
      skip: skip,
    });
  }

  async findOne(id: string) {
    const category = await this.categoryRepository.findOneBy({ id });
    if (!category) {
      throw new NotFoundException(`The category with id: ${id} does not exist`);
    }
    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    await this.findOne(id);
    const nameCategory = await this.findOneByName(updateCategoryDto.name);
    if (nameCategory) {
      throw new ConflictException('the category name already exists');
    }
    return await this.categoryRepository.update(id, {
      ...updateCategoryDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return await this.categoryRepository.softDelete(id);
  }
}
