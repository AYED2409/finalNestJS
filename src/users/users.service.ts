import {
  Injectable,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  StreamableFile,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as uuid from 'uuid';
import { UserInterface } from 'src/commons/interfaces/user.interface';
import { PaginationUserDto } from './dto/pagination-user.dto';
import { OrderBy } from './enums/users.enum';
import * as bcryptjs from 'bcryptjs';
import { UserActiveInterface } from 'src/commons/interfaces/user-active.interface';
import { Role } from 'src/commons/enums/roles.enum';
import * as path from 'path';
import * as fsPromises from 'fs/promises';
import { createReadStream } from 'fs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const emailUser = await this.findOneByEmail(createUserDto.email);
    const usernameUser = await this.findOneByUsername(createUserDto.username);
    if (emailUser) {
      throw new ConflictException('Email already registered');
    }
    if (usernameUser) {
      throw new ConflictException('Existing username');
    }
    const id = uuid.v4();
    return this.userRepository.save({
      ...createUserDto,
      password: await bcryptjs.hash(createUserDto.password, 5),
      // password: await bcryptjs.hash(createUserDto.password, 5),
      id,
    });
  }

  async findAll(pagination: PaginationUserDto) {
    const { page, limit, order, orderBy } = pagination;
    const orderValue = this.getValueOrderBy(orderBy, order);
    const skip = (page - 1) * limit;
    return this.userRepository.find({
      select: [
        'id',
        'username',
        'email',
        'role',
        'image',
        'createAt',
        'updateAt',
        'deleteAt',
      ],
      take: limit,
      skip: skip,
      order: orderValue,
    });
  }

  async findOne(id: string) {
    const user = await this.findOneById(id);
    if (!user) {
      throw new NotFoundException('User Not Found');
    }
    return user;
  }

  async findOneEmail(email: string) {
    const user = await this.findOneByEmail(email);
    if (!user) {
      throw new NotFoundException('Email Not found');
    }
    return user;
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    userActive: UserActiveInterface,
  ) {
    const user = await this.findOneById(id);
    if (!user) {
      throw new NotFoundException('User Not Found');
    }
    if (user.id == userActive.id || userActive.role == Role.ADMIN) {
      if (updateUserDto.email) {
        await this.validateEmail(updateUserDto.email, user);
      }
      if (updateUserDto.username) {
        await this.validateUsername(updateUserDto.username, user);
      }
      if (updateUserDto.password) {
        updateUserDto.password = await bcryptjs.hash(updateUserDto.password, 5);
      }
      return await this.userRepository.update(id, {
        ...updateUserDto,
      });
    } else {
      throw new UnauthorizedException('You do not have permissions');
    }
  }

  async remove(id: string) {
    const user = await this.findOneById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return await this.userRepository.delete(id);
  }

  async findOneByEmail(email: string) {
    return await this.userRepository.findOne({
      select: ['id', 'username', 'role', 'email', 'password', 'image'],
      where: { email },
    });
  }

  async findOneByUsername(username: string) {
    return await this.userRepository.findOneBy({ username: username });
  }

  async findOneById(id: string) {
    return await this.userRepository.findOneBy({ id: id });
  }

  async uploadImage(
    userActive: UserActiveInterface,
    file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('The image must be entered');
    }
    const contentImage = file.mimetype.split('/');
    const extension = contentImage[1];
    if (extension != 'jpg' && extension != 'jpeg') {
      throw new BadRequestException('Only jpg and jpeg images are allowed');
    }
    try {
      const currentPath = process.cwd();
      const routeUpload = `uploads/${userActive.id}/image/`;
      const route = path.join(currentPath, routeUpload);
      const result = fsPromises
        .access(route)
        .then(() => true)
        .catch(() => false);
      if (result) {
        await fsPromises.mkdir(route, { recursive: true });
        const routeFile = path.join(route, `image-profile.${extension}`);
        await fsPromises.writeFile(routeFile, file.buffer);
        return this.userRepository.update(userActive.id, {
          image: routeFile,
        });
      }
    } catch (error) {
      throw new BadRequestException(
        `There was an error uploading the image : ${error}`,
      );
    }
  }

  private async validateEmail(email: string, user: UserInterface) {
    const UserEntity = await this.findOneByEmail(email);
    if (UserEntity && UserEntity.email !== user.email) {
      throw new ConflictException('Impossible to assign this Email');
    }
    return email;
  }

  private async validateUsername(name: string, user: UserInterface) {
    const UserEntity = await this.findOneByUsername(name);
    if (UserEntity && UserEntity.username !== user.username) {
      throw new ConflictException('Impossible to assign that Username');
    }
    return name;
  }

  getValueOrderBy(orderBy: string, order: string) {
    let value;
    switch (orderBy) {
      case OrderBy.creationDate:
        value = { createAt: order };
        break;
      case OrderBy.email:
        value = { email: order };
        break;
      case OrderBy.id:
        value = { id: order };
        break;
      case OrderBy.userName:
        value = { username: order };
        break;
      default:
        value = { createAt: order };
    }
    return value;
  }
}
