import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFile,
  Request,
  UseInterceptors,
  ParseUUIDPipe,
  Query,
  ValidationPipe,
  Header,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { VideosService } from './videos.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { ActiveUser } from 'src/commons/decorators/user-active.decorator';
import { UserActiveInterface } from 'src/commons/interfaces/user-active.interface';
import * as multer from 'multer';
import { ValidFileInterceptor } from './interceptors/validFile.interceptor';
import { PaginationVideoDto } from './dto/pagtination-video.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { VideoCreateResponseDto } from 'src/commons/dto/swagger/video/videoCreateResponse.dto';
import { VideoResponseDto } from 'src/commons/dto/swagger/video/videoResponse.dto';
import { VideoSearchResponseDto } from 'src/commons/dto/swagger/video/videoSearchResponse.dto';
import { DeleteUpdateResponseDto } from 'src/commons/dto/swagger/delete-updateResponse.dto';
import { UnauthorizedResponseDto } from 'src/commons/dto/swagger/errors/unauthorizedResponse.dto';
import { NotFoundResponsetDto } from 'src/commons/dto/swagger/errors/notFoundResponse.dto';
import { BadRequestResponsetDto } from 'src/commons/dto/swagger/errors/badRequestResponse.dto';
import { InternalErrorResponsetDto } from 'src/commons/dto/swagger/errors/internalErrorResponse.dto';
import { UploadThumbnailVideoDto } from './dto/uploadThumbnailVideo.dto';
import { UploadImageProfileDto } from 'src/users/dto/uploadImageProfile.dto';
import { Response } from 'express';
import { join } from 'path';

@ApiTags('videos')
@Controller('videos')
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  @ApiBearerAuth()
  @Auth()
  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.memoryStorage(),
    }),
    ValidFileInterceptor,
  )
  @ApiOperation({ summary: 'Crear un video' })
  @ApiCreatedResponse({
    description: 'Video creado exitosamente',
    type: VideoCreateResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'No autorizado, token no valido',
    type: UnauthorizedResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'No se encontro la categoria con el nombre indicado',
    type: NotFoundResponsetDto,
  })
  @ApiBadRequestResponse({
    description: 'Tipos de parametros incorrectos',
    type: BadRequestResponsetDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Error producido en el servidor',
    type: InternalErrorResponsetDto,
  })
  async uploadFile(
    @Request() req,
    @ActiveUser() userActive: UserActiveInterface,
    @Body() createVideoDto: CreateVideoDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.videosService.create(
      createVideoDto,
      userActive,
      file,
      req.prefix,
    );
  }
  //obtener el video (fichero)
  @Get(':videoId/file')
  @Header('Content-Type', 'video/mp4')
  @Header('Content-Disposition', 'attachment')
  @ApiOperation({ summary: 'obtener el fichero de video en un stream' })
  @ApiResponse({
    description: 'OK, se obtiene el fichero del video en stream',
    status: 200,
  })
  @ApiBadRequestResponse({
    description: 'tipo de parametro incorrecto',
    type: BadRequestResponsetDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Error producido en el servidor',
    type: InternalErrorResponsetDto,
  })
  @ApiNotFoundResponse({
    description: 'Id del Video no encontrado',
    type: NotFoundResponsetDto,
  })
  async getVideoFile(@Param('videoId', ParseUUIDPipe) videoId: string) {
    return this.videosService.getVideoFile(videoId);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener lista de videos' })
  @ApiResponse({
    description: 'OK, se obteniene lista de videos exitosamente',
    status: 200,
    isArray: true,
    type: VideoResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Tipo de parametros incorrectos',
    type: BadRequestResponsetDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Error producido en el servidor',
    type: InternalErrorResponsetDto,
  })
  findAll(@Query(ValidationPipe) pagination: PaginationVideoDto) {
    return this.videosService.findAll(pagination);
  }

  @ApiBearerAuth()
  @Auth()
  @Get('myVideos')
  @ApiOperation({ summary: 'Obtener videos del usuario logueado' })
  @ApiUnauthorizedResponse({
    description: 'No autorizado, token no valido',
    type: UnauthorizedResponseDto,
  })
  @ApiResponse({
    description: 'OK, se obtienen los videos del usuario logueado',
    status: 200,
    isArray: true,
    type: VideoResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Tipo de parametros incorrectos',
    type: BadRequestResponsetDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Error producido en el servidor',
    type: InternalErrorResponsetDto,
  })
  findAllOfUser(
    @ActiveUser() userActive: UserActiveInterface,
    @Query(ValidationPipe) pagination: PaginationVideoDto,
  ) {
    return this.videosService.findAllOfUser(userActive, pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener video con id indicado' })
  @ApiNotFoundResponse({
    description: 'Id del Video no encontrado',
    type: NotFoundResponsetDto,
  })
  @ApiResponse({
    description: 'OK, se obtiene el videos',
    status: 200,
    type: VideoResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Tipos de parametros incorrectos',
    type: BadRequestResponsetDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Error producido en el servidor',
    type: InternalErrorResponsetDto,
  })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.videosService.getOne(id);
  }

  //obteter los videos de un usuario por ID
  @Get('user/:userId')
  @ApiOperation({
    summary: 'Obtener los videos de un usuario, indicando su id',
  })
  @ApiNotFoundResponse({
    description: 'Id del Usuario no encontrado',
    type: NotFoundResponsetDto,
  })
  @ApiBadRequestResponse({
    description: 'Tipo de parametros incorrectos',
    type: BadRequestResponsetDto,
  })
  @ApiResponse({
    description: 'OK, se obtienen los videos del usuario',
    status: 200,
    isArray: true,
    type: VideoResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Error producido en el servidor',
    type: InternalErrorResponsetDto,
  })
  getUserVideos(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query(ValidationPipe) pagination: PaginationVideoDto,
  ) {
    return this.videosService.findUserVideos(userId, pagination);
  }
  // obtener los videos con la categoria pasada (nombre de la categoria)
  @Get('category/:categoryName')
  @ApiOperation({
    summary:
      'Obtener los videos que pertenecen a una categoria, indicando su nombre',
  })
  @ApiNotFoundResponse({
    description: 'Nombre de la categoria no encontrado',
    type: NotFoundResponsetDto,
  })
  @ApiResponse({
    description: 'OK, se obtienen los videos de la categoría',
    status: 200,
    type: VideoResponseDto,
    isArray: true,
  })
  @ApiBadRequestResponse({
    description: 'Tipo de parametros incorrectos',
    type: BadRequestResponsetDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Error producido en el servidor',
    type: InternalErrorResponsetDto,
  })
  getCategoryVideo(
    @Param('categoryName') categoryName: string,
    @Query(ValidationPipe) pagination: PaginationVideoDto,
  ) {
    return this.videosService.findCategoryVideos(categoryName, pagination);
  }
  //obtener los videos que contengan (en el titulo, tag o category) el valor pasado
  @Get('search/:search')
  @ApiOperation({
    summary:
      'Obtener los videos que contengan en su titulo, tag o categoria el valor introducido',
  })
  @ApiResponse({
    description: 'OK, se obtiene la busqueda',
    status: 200,
    isArray: true,
    type: VideoSearchResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Tipo de parametros incorrectos',
    type: BadRequestResponsetDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Error producido en el servidor',
    type: InternalErrorResponsetDto,
  })
  getSearch(
    @Param('search') search: string,
    @Query(ValidationPipe) pagination: PaginationVideoDto,
  ) {
    return this.videosService.getSearch(search, pagination);
  }

  @ApiBearerAuth()
  @Auth()
  @Patch(':id')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.memoryStorage(),
    }),
    ValidFileInterceptor,
  )
  @ApiOperation({ summary: 'Actualiazar el video indicando su id' })
  @ApiResponse({
    status: 200,
    description: 'Actualizacion exitosa',
    type: DeleteUpdateResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'No autorizado, token no valido / El video no te pertenece',
    type: UnauthorizedResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Video no encontrado / Categoría no encontrada',
    type: NotFoundResponsetDto,
  })
  @ApiBadRequestResponse({
    description:
      'Error en la actualizacion del fichero / Tipo de parametros incorrectos.',
    type: BadRequestResponsetDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Error producido en el servidor',
    type: InternalErrorResponsetDto,
  })
  async update(
    @Request() req,
    @ActiveUser() userActive: UserActiveInterface,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateVideoDto: UpdateVideoDto,
    @UploadedFile() file: Express.Multer.File | undefined,
  ) {
    return this.videosService.update(
      id,
      updateVideoDto,
      userActive,
      file,
      req.prefix,
    );
  }

  @ApiBearerAuth()
  @Auth()
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un video, indicando su id' })
  @ApiResponse({
    description: ' Video eliminado correctamente',
    status: 200,
    type: DeleteUpdateResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Id del Video no encontrado',
    type: NotFoundResponsetDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Token invalido / El video no te pertenece',
    type: UnauthorizedResponseDto,
  })
  @ApiBadRequestResponse({
    description:
      'Error producido mientras se borraba el Video / Tipo de parametros incorrectos.',
    type: BadRequestResponsetDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Error producido en el servidor',
    type: InternalErrorResponsetDto,
  })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @ActiveUser() userActive: UserActiveInterface,
  ) {
    return this.videosService.remove(id, userActive);
  }

  //subir thumbnain
  @ApiBearerAuth()
  @Auth()
  @Post('/thumbnail/:idVideo')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Subir thumbnail de video' })
  @ApiCreatedResponse({
    description: 'Thumbnail subida correctamente',
    type: VideoResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'No autorizado, token no valido',
    type: NotFoundResponsetDto,
  })
  @ApiBadRequestResponse({
    description: 'parametro incorrecto o formato de imagen incorrecto',
    type: BadRequestResponsetDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Error producido en el servidor',
    type: InternalErrorResponsetDto,
  })
  @UseInterceptors(FileInterceptor('thumbnail'))
  async uploadImage(
    @ActiveUser() userActive: UserActiveInterface,
    @Param('idVideo', ParseUUIDPipe) idVideo: string,
    @UploadedFile() file,
    @Body() UploadImage: UploadThumbnailVideoDto,
  ) {
    return this.videosService.uploadThumbnail(userActive, idVideo, file);
  }

  //obtener thumbnail video

  @Get('thumbnail/:idVideo')
  @ApiOperation({ summary: 'Obtener imagen del usuario' })
  @ApiNotFoundResponse({
    description: 'No se encontro la imagen',
    type: NotFoundResponsetDto,
  })
  @ApiBadRequestResponse({
    description: 'Tipo de parametro incorrecto',
    type: BadRequestResponsetDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Error producido en el servidor',
    type: InternalErrorResponsetDto,
  })
  async getThumbnail(
    @Param('idVideo', ParseUUIDPipe) idVideo: string,
    @Res() res: Response,
  ) {
    const video = await this.videosService.getOne(idVideo);
    if (video.thumbnail == null) {
      throw new BadRequestException('El video no tiene thumbnail');
    }
    return res.sendFile(video.thumbnail);
  }
}
