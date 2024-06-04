import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { LikesService } from './likes.service';
import { CreateLikeDto } from './dto/create-like.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ActiveUser } from 'src/commons/decorators/user-active.decorator';
import { UserActiveInterface } from 'src/commons/interfaces/user-active.interface';
import { PaginationLikeDto } from './dto/pagination-like.dto';
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
import { BadRequestResponsetDto } from 'src/commons/dto/swagger/errors/badRequestResponse.dto';
import { NotFoundResponsetDto } from 'src/commons/dto/swagger/errors/notFoundResponse.dto';
import { DeleteUpdateResponseDto } from 'src/commons/dto/swagger/delete-updateResponse.dto';
import { ConflictResponseDto } from 'src/commons/dto/swagger/errors/conflictResponse.dto';
import { UnauthorizedResponseDto } from 'src/commons/dto/swagger/errors/unauthorizedResponse.dto';
import { LikeCreateResponseDto } from 'src/commons/dto/swagger/like/likeCreateResponse.dto';
import { LikeResponseDto } from 'src/commons/dto/swagger/like/likeResponse.dto';
import { InternalErrorResponsetDto } from 'src/commons/dto/swagger/errors/internalErrorResponse.dto';

@ApiTags('likes')
@Controller('likes')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @ApiBearerAuth()
  @Auth()
  @Post()
  @ApiOperation({ summary: 'Dar like a un video' })
  @ApiUnauthorizedResponse({
    description: 'No autorizado, token no valido',
    type: UnauthorizedResponseDto,
  })
  @ApiCreatedResponse({
    description: 'Like creado exitosamente',
    type: LikeCreateResponseDto,
  })
  @ApiConflictResponse({
    description: 'Ya tiene like',
    type: ConflictResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Video indicado no encontrado',
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
  create(
    @Body() createLikeDto: CreateLikeDto,
    @ActiveUser() userActive: UserActiveInterface,
  ) {
    return this.likesService.create(createLikeDto, userActive);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los likes' })
  @ApiResponse({
    description: 'OK, se obtienen todos los likes',
    status: 200,
    isArray: true,
    type: LikeResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Tipo de parametros incorrectos',
    type: BadRequestResponsetDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Error producido en el servidor',
    type: InternalErrorResponsetDto,
  })
  findAll(@Query(ValidationPipe) pagination: PaginationLikeDto) {
    return this.likesService.findAll(pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un like, indicando su id' })
  @ApiResponse({
    description: 'OK, se obtiene el like',
    status: 200,
    type: LikeResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Id del like no encontrado',
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
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.likesService.findOne(id);
  }

  //obtiene los likes de un video
  @Get('video/:videoId')
  @ApiOperation({
    summary: 'Obtener los likes de un video, indicando el id del video',
  })
  @ApiNotFoundResponse({
    description: 'Id del Video no encontrado',
    type: NotFoundResponsetDto,
  })
  @ApiBadRequestResponse({
    description: 'Tipo de parametros incorrectos',
    type: BadRequestResponsetDto,
  })
  @ApiResponse({
    description: 'OK, se obtienen los likes',
    status: 200,
    type: LikeResponseDto,
    isArray: true,
  })
  @ApiInternalServerErrorResponse({
    description: 'Error producido en el servidor',
    type: InternalErrorResponsetDto,
  })
  likesOfAVideo(
    @Param('videoId', ParseUUIDPipe) videoId: string,
    @Query(ValidationPipe) pagination: PaginationLikeDto,
  ) {
    return this.likesService.getLikesOfAVideo(videoId, pagination);
  }

  @ApiBearerAuth()
  @Auth()
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un like, indicando su id' })
  @ApiUnauthorizedResponse({
    description: 'No autorizado, token no valido / No es su like',
    type: UnauthorizedResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Id del like no encontrado',
    type: NotFoundResponsetDto,
  })
  @ApiResponse({
    description: 'Like eliminado exitosamente',
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
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @ActiveUser() userActive: UserActiveInterface,
  ) {
    return this.likesService.remove(id, userActive);
  }
}
