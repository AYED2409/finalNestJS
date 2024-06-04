import {
  BadRequestException,
  Injectable,
  NotFoundException,
  StreamableFile,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { UserActiveInterface } from 'src/commons/interfaces/user-active.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Video } from './entities/video.entity';
import { Repository } from 'typeorm';
import * as uuid from 'uuid';
import * as path from 'path';
import * as fsPromises from 'fs/promises';
import { PaginationVideoDto } from './dto/pagtination-video.dto';
import { UsersService } from 'src/users/users.service';
import { OrderBy } from './enums/orderBy-video.enum';
import { CategoriesService } from 'src/categories/categories.service';
import { Role } from 'src/commons/enums/roles.enum';
import { createReadStream } from 'fs';

@Injectable()
export class VideosService {
  constructor(
    @InjectRepository(Video)
    private readonly videoRepository: Repository<Video>,
    private readonly usersService: UsersService,
    private readonly categoriesService: CategoriesService,
  ) {}

  async create(
    createVideoDto: CreateVideoDto,
    userActive: UserActiveInterface,
    file: Express.Multer.File,
    prefix: string,
  ) {
    const category = await this.categoriesService.findOneByName(
      createVideoDto.category,
    );
    const user = await this.usersService.findOne(userActive.id);
    const extension = this.extractExtension(file.mimetype);
    const currentPath = process.cwd(); // Ruta raiz del servidor
    const route = `uploads/${user.id}/videos/${prefix}-${file.originalname}.${extension}`; // Ruta donde se guarda el fichero
    const filePath = path.join(currentPath, route); //Ruta absoluta donde se guarda el fichero
    const id = uuid.v4();
    return await this.videoRepository.save({
      id,
      title: createVideoDto.title,
      numLikes: 0,
      user,
      category,
      filePath,
      description: createVideoDto.description,
    });
  }

  async findAll(pagination: PaginationVideoDto) {
    const { page, limit, order, orderBy } = pagination;
    const orderValue = this.getValueOrderBy(orderBy, order);
    const skip = (page - 1) * limit;
    return await this.videoRepository.find({
      relations: ['category'],
      take: limit,
      skip: skip,
      order: orderValue,
    });
  }

  async findUserVideos(userId: string, pagination: PaginationVideoDto) {
    await this.usersService.findOne(userId);
    const { page, limit, order, orderBy } = pagination;
    const skip = (page - 1) * limit;
    const orderValue = this.getValueOrderBy(orderBy, order);
    return await this.videoRepository.find({
      relations: ['category', 'user', 'comments'],
      where: { user: { id: userId } },
      take: limit,
      skip: skip,
      order: orderValue,
    });
  }

  async findAllOfUser(
    userActive: UserActiveInterface,
    pagination: PaginationVideoDto,
  ) {
    await this.usersService.findOne(userActive.id);
    const { page, limit, order, orderBy } = pagination;
    const orderValue = this.getValueOrderBy(orderBy, order);
    const skip = (page - 1) * limit;
    const userVideo = await this.videoRepository.find({
      relations: ['category'],
      where: { user: { id: userActive.id } },
      take: limit,
      skip: skip,
      order: orderValue,
    });
    return userVideo;
  }

  async getSearch(search: string, pagination: PaginationVideoDto) {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;
    return await this.videoRepository
      .createQueryBuilder('video')
      .leftJoinAndSelect('video.user', 'user')
      .leftJoinAndSelect('video.category', 'category')
      .leftJoinAndSelect('video.videoTags', 'videoTag')
      .leftJoinAndSelect('videoTag.tag', 'tag')
      .where('video.title ILIKE :search', { search: `%${search}%` })
      .orWhere('category.name ILIKE :search', { search: `%${search}%` })
      .orWhere('tag.name ILIKE :search', { search: `%${search}%` })
      .take(limit)
      .skip(skip)
      .getMany();
  }

  async findOne(id: string, userActive: UserActiveInterface) {
    const video = await this.videoRepository.findOneBy({ id });
    if (!video) {
      throw new NotFoundException('No existe video con ese id');
    }
    if (
      userActive.email !== video.user.email &&
      userActive.role !== Role.ADMIN
    ) {
      throw new UnauthorizedException('No tienes acceso al video');
    }
    return video;
  }

  async findCategoryVideos(
    categoryName: string,
    pagination: PaginationVideoDto,
  ) {
    await this.categoriesService.findOneByName(categoryName);
    const { page, limit, order, orderBy } = pagination;
    const orderValue = this.getValueOrderBy(orderBy, order);
    const skip = (page - 1) * limit;
    return await this.videoRepository.find({
      relations: ['category'],
      where: { category: { name: categoryName } },
      take: limit,
      skip: skip,
      order: orderValue,
    });
  }

  async getOne(idVideo: string) {
    const video = await this.videoRepository.findOneBy({ id: idVideo });
    if (!video) {
      throw new NotFoundException('no se encontro Video indicado');
    }
    return video;
  }

  async update(
    id: string,
    updateVideoDto: UpdateVideoDto,
    userActive: UserActiveInterface,
    file: Express.Multer.File,
    prefixFile: string,
  ) {
    await this.getOne(id);
    const video = await this.findOne(id, userActive);
    let route = video.filePath;
    if (this.checkVideoInMethodUpdate(file)) {
      await this.removeVideoLocal(video);
      const routeFile = await this.createFile(userActive.id, file, prefixFile);
      route = routeFile;
    }
    return await this.videoRepository.update(id, {
      title: updateVideoDto.title ? updateVideoDto.title : video.title,
      category: updateVideoDto.category
        ? await this.categoriesService.existCategoryByName(
            updateVideoDto.category,
          )
        : video.category,
      filePath: route,
      description: updateVideoDto.description
        ? updateVideoDto.description
        : video.description,
    });
  }

  async remove(id: string, userActive: UserActiveInterface) {
    const video = await this.findOne(id, userActive);
    try {
      await fsPromises.access(video.filePath);
      await fsPromises.unlink(video.filePath);
      return await this.videoRepository.delete(id);
    } catch (error) {
      throw new BadRequestException(`Error deleting video ${error}`);
    }
  }

  checkVideoInMethodUpdate(file: Express.Multer.File) {
    if (file) {
      return true;
    }
    return false;
  }

  async removeVideoLocal(video: Video) {
    try {
      await fsPromises.access(video.filePath);
      await fsPromises.unlink(video.filePath);
    } catch (error) {
      throw new BadRequestException('File access or deletion error');
    }
  }

  async createFile(
    userId: string,
    file: Express.Multer.File,
    prefixFile: string,
  ) {
    try {
      const currentPath = process.cwd();
      const routeUpload = `uploads/${userId}/videos/`;
      const route = path.join(currentPath, routeUpload);
      const result = fsPromises
        .access(route)
        .then(() => true)
        .catch(() => false);
      if (result) {
        await fsPromises.mkdir(route, { recursive: true });
        const extension = this.extractExtension(file.mimetype);
        const routeFile = path.join(
          route,
          `${prefixFile}-${file.originalname}.${extension}`,
        );
        await fsPromises.writeFile(routeFile, file.buffer);
        return `${routeFile}`;
      }
    } catch (error) {
      throw new BadRequestException(
        `An error occurred while uploading the file: ${error}`,
      );
    }
  }

  isValidVideoMagicNumber(buffer: Buffer): boolean {
    const mp4MagicNumber = [0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70]; // Número mágico para archivos MP4
    const webmMagicNumber = [0x1A, 0x45, 0xDF, 0xA3]; // Número mágico para archivos WebM
    // const aviMagicNumber = [0x52, 0x49, 0x46, 0x46]; // Número mágico para archivos AVI
    if (
      this.compareMagicNumber(buffer, mp4MagicNumber) ||
      this.compareMagicNumber(buffer, webmMagicNumber)
      // ||
      // this.compareMagicNumber(buffer, aviMagicNumber)
    ) {
      return true;
    }
    return false;
  }

  compareMagicNumber(buffer: Buffer, magicNumber: number[]): boolean {
    if (buffer.length < magicNumber.length) {
      return false;
    }
    for (let i = 0; i < magicNumber.length; i++) {
      if (buffer.readUInt8(i) !== magicNumber[i]) {
        return false;
      }
    }
    return true;
  }

  extractExtension(mimeTypefile: string): string {
    const content = mimeTypefile.split('/');
    return content[1];
  }

  async existVideo(idVideo: string) {
    const video = await this.videoRepository.findOneBy({ id: idVideo });
    if (video) {
      return true;
    }
    return false;
  }

  getValueOrderBy(orderBy: string, order: string) {
    let value;
    switch (orderBy) {
      case OrderBy.date:
        value = { createAt: order };
        break;
      case OrderBy.category:
        value = { category: { name: order } };
        break;
      case OrderBy.id:
        value = { id: order };
        break;
      case OrderBy.likes:
        value = { numLikes: order };
        break;
      case OrderBy.title:
        value = { title: order };
        break;
      default:
        value = { createAt: order };
    }
    return value;
  }

  async getVideoFile(videoId: string) {
    const video = await this.getOne(videoId);
    const file = createReadStream(video.filePath);
    return new StreamableFile(file);
  }

  async uploadThumbnail(
    userActive: UserActiveInterface,
    videoId: string,
    thumbnailFile: Express.Multer.File,
  ) {
    await this.findOne(videoId, userActive);
    if (!thumbnailFile) {
      throw new BadRequestException('Thumbnail not entered');
    }
    const contThumbnail = thumbnailFile.mimetype.split('/');
    const extension = contThumbnail[1];
    if (extension != 'jpg' && extension != 'jpeg') {
      throw new BadRequestException(
        'Only images in jpg and jpeg format are allowed.',
      );
    }
    try {
      const currentPath = process.cwd();
      const routeUpload = `uploads/${userActive.id}/image/${videoId}/`;
      const route = path.join(currentPath, routeUpload);
      const result = fsPromises
        .access(route)
        .then(() => true)
        .catch(() => false);
      if (result) {
        await fsPromises.mkdir(route, { recursive: true });
        const routeFile = path.join(route, `thumbnail.${extension}`);
        await fsPromises.writeFile(routeFile, thumbnailFile.buffer);
        return this.videoRepository.update(videoId, {
          thumbnail: routeFile,
        });
      }
    } catch (error) {
      throw new BadRequestException(
        `An error occurred while uploading the image: ${error}`,
      );
    }
  }
}
