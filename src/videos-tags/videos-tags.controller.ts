import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { VideosTagsService } from './videos-tags.service';
import { CreateVideoTagDto } from './dto/create-video-tag.dto';
import { UpdateVideoTagDto } from './dto/update-video-tag.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ActiveUser } from 'src/commons/decorators/user-active.decorator';
import { UserActiveInterface } from 'src/commons/interfaces/user-active.interface';
import { PaginationVideosTagsDto } from './dto/pagination-videoTag.dto';
import { PaginationVideosWithTagDto } from './dto/pagination-videosWithTag.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UnauthorizedResponseDto } from 'src/commons/dto/swagger/errors/unauthorizedResponse.dto';
import { NotFoundResponsetDto } from 'src/commons/dto/swagger/errors/notFoundResponse.dto';
import { ConflictResponseDto } from 'src/commons/dto/swagger/errors/conflictResponse.dto';
import { BadRequestResponsetDto } from 'src/commons/dto/swagger/errors/badRequestResponse.dto';
import { VideoTagCreateResponseDto } from 'src/commons/dto/swagger/videoTag/videoTagCreateResponse.dto';
import { VideoTagResponseDto } from 'src/commons/dto/swagger/videoTag/videoTag-TagResponse.dto';
import { DeleteUpdateResponseDto } from 'src/commons/dto/swagger/delete-updateResponse.dto';
import { VideoTagResponseVideoDto } from 'src/commons/dto/swagger/videoTag/videoTagResponseVideo.dto';
import { InternalErrorResponsetDto } from 'src/commons/dto/swagger/errors/internalErrorResponse.dto';

@ApiTags('videos-tags')
@Controller('videos-tags')
export class VideosTagsController {
  constructor(private readonly videosTagsService: VideosTagsService) {}

  @ApiBearerAuth()
  @Auth()
  @Post()
  @ApiOperation({ summary: 'Crear un video-tag' })
  @ApiCreatedResponse({
    description: 'Video-Tag creado exitosamente',
    type: VideoTagCreateResponseDto,
  })
  @ApiUnauthorizedResponse({
    description:
      'No autorizado, token no valido / No tiene permiso para asignar un tag al video',
    type: UnauthorizedResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Video a asignar no encontrado / Tag a asignar no encontrado',
    type: NotFoundResponsetDto,
  })
  @ApiConflictResponse({
    description: 'Ya se encuentra asignado ese video-tag',
    type: ConflictResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Tipo de parametros incorrectos',
    type: BadRequestResponsetDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Error producido en el servidor',
    type: InternalErrorResponsetDto,
  })
  create(
    @Body() createVideosTagDto: CreateVideoTagDto,
    @ActiveUser() userActive: UserActiveInterface,
  ) {
    return this.videosTagsService.create(createVideosTagDto, userActive);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los video-tag' })
  @ApiResponse({
    description: 'Ok, se obtienen los video-tag',
    type: VideoTagCreateResponseDto,
    isArray: true,
    status: 200,
  })
  @ApiBadRequestResponse({
    description: 'Tipo de parametros incorrectos',
    type: BadRequestResponsetDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Error producido en el servidor',
    type: InternalErrorResponsetDto,
  })
  findAll(@Query(ValidationPipe) pagination: PaginationVideosTagsDto) {
    return this.videosTagsService.findAll(pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un video-tag, indicando su id' })
  @ApiNotFoundResponse({
    description: 'Id del video-tag no encontrado',
    type: NotFoundResponsetDto,
  })
  @ApiBadRequestResponse({
    description: 'Tipo de parametros incorrectos',
    type: BadRequestResponsetDto,
  })
  @ApiResponse({
    description: 'OK, se obtiene el video-tag',
    status: 200,
    type: VideoTagCreateResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Error producido en el servidor',
    type: InternalErrorResponsetDto,
  })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.videosTagsService.findOne(id);
  }
  // obtener los tags de un video
  @Get('tags/video/:videoId')
  @ApiOperation({ summary: 'Obtener los tags de un video' })
  @ApiResponse({
    description: 'OK, se obtienen los tags del video',
    status: 200,
    type: VideoTagResponseDto,
    isArray: true,
  })
  @ApiNotFoundResponse({
    description: 'Id del video no encontrado',
    type: NotFoundResponsetDto,
  })
  @ApiBadRequestResponse({
    description: 'Tipo de parametros incorrectos',
    type: BadRequestResponsetDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Error producido en el servidor',
    type: InternalErrorResponsetDto,
  })
  tagsOfAVideo(
    @Param('videoId', ParseUUIDPipe) videoId: string,
    @Query(ValidationPipe) pagination: PaginationVideosTagsDto,
  ) {
    return this.videosTagsService.findTagsOfAVideo(videoId, pagination);
  }
  //obtener los videos que tengan un tag indicado
  @Get('videos/tag/:tagId')
  @ApiOperation({
    summary:
      'Obtener los videos que contengan el tag indicado, indicando su id',
  })
  @ApiResponse({
    description: 'OK, se obtienen los videos con ese tag',
    status: 200,
    type: VideoTagResponseVideoDto,
    isArray: true,
  })
  @ApiNotFoundResponse({
    description: 'Id del tag no encontrado',
    type: NotFoundResponsetDto,
  })
  @ApiBadRequestResponse({
    description: 'Tipo de parametros incorrectos',
    type: BadRequestResponsetDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Error producido en el servidor',
    type: InternalErrorResponsetDto,
  })
  videosWithTag(
    @Param('tagId', ParseUUIDPipe) tagId: string,
    @Query(ValidationPipe) pagination: PaginationVideosWithTagDto,
  ) {
    return this.videosTagsService.findVideosWithTag(tagId, pagination);
  }

  @ApiBearerAuth()
  @Auth()
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un video-tag, indicando su id' })
  @ApiNotFoundResponse({
    description: 'Id del video-tag no encontrado',
    type: NotFoundResponsetDto,
  })
  @ApiUnauthorizedResponse({
    description: 'No autorizado, token no valido / el video no le pertenece',
    type: UnauthorizedResponseDto,
  })
  @ApiResponse({
    description: 'video-tag actualizado exitosamente',
    status: 200,
    type: DeleteUpdateResponseDto,
  })
  @ApiConflictResponse({
    description: 'Ya se encuentra asignado el tag al video',
    type: ConflictResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Tipo de parametros incorrectos',
    type: BadRequestResponsetDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Error producido en el servidor',
    type: InternalErrorResponsetDto,
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateVideosTagDto: UpdateVideoTagDto,
    @ActiveUser() userActive: UserActiveInterface,
  ) {
    return this.videosTagsService.update(id, updateVideosTagDto, userActive);
  }

  @ApiBearerAuth()
  @Auth()
  @Delete('tags/video/:videoId')
  @ApiOperation({
    summary:
      'Eliminar todas las etiquetas de un video,indicando el id del video',
  })
  @ApiNotFoundResponse({
    description: 'Id del video no encontrado',
    type: NotFoundResponsetDto,
  })
  @ApiUnauthorizedResponse({
    description: 'No autorizado, token no valido / video no le pertenece',
    type: UnauthorizedResponseDto,
  })
  @ApiResponse({
    description: 'Borrado masivo de video-tag exitosamente',
    status: 200,
    type: DeleteUpdateResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Tipo de parametros incorrectos',
    type: BadRequestResponsetDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Error producido en el servidor',
    type: InternalErrorResponsetDto,
  })
  removeAllTagsFromVideo(
    @Param('videoId', ParseUUIDPipe) videoId: string,
    @ActiveUser() userActive: UserActiveInterface,
  ) {
    return this.videosTagsService.removeAllTagsFromVideo(videoId, userActive);
  }

  @ApiBearerAuth()
  @Auth()
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un video-tag, indicando el id' })
  @ApiUnauthorizedResponse({
    description: 'No autorizado, token no valido / video no le pertenece',
  })
  @ApiNotFoundResponse({
    description: 'Id del video-tag no encontrado',
    type: NotFoundResponsetDto,
  })
  @ApiResponse({
    description: 'video-tag eliminado exitosamente',
    type: DeleteUpdateResponseDto,
    status: 200,
  })
  @ApiBadRequestResponse({
    description: 'Tipo de parametros incorrectos',
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
    return this.videosTagsService.remove(id, userActive);
  }
}
