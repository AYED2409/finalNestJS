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
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ActiveUser } from 'src/commons/decorators/user-active.decorator';
import { UserActiveInterface } from 'src/commons/interfaces/user-active.interface';
import { PaginationCommentDto } from './dto/pagination-comment.dto';
import { PaginationUserCommentsDto } from './dto/pagination-userComments.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { NotFoundResponsetDto } from 'src/commons/dto/swagger/errors/notFoundResponse.dto';
import { BadRequestResponsetDto } from 'src/commons/dto/swagger/errors/badRequestResponse.dto';
import { CommentCreateResponseDto } from 'src/commons/dto/swagger/comment/commentCreateResponse.dto';
import { CommentResponseDto } from 'src/commons/dto/swagger/comment/commentResponse.dto';
import { UnauthorizedResponseDto } from 'src/commons/dto/swagger/errors/unauthorizedResponse.dto';
import { DeleteUpdateResponseDto } from 'src/commons/dto/swagger/delete-updateResponse.dto';
import { CommentUserResponseDto } from 'src/commons/dto/swagger/comment/commentUserResponse.dto';
import { InternalErrorResponsetDto } from 'src/commons/dto/swagger/errors/internalErrorResponse.dto';

@ApiTags('comments')
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @ApiBearerAuth()
  @Auth()
  @Post()
  @ApiOperation({ summary: 'Agregar un comentario a un video' })
  @ApiCreatedResponse({
    description: 'Comentario creado exitosamente',
    type: CommentCreateResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Video indicado no existe',
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
    @Body() createCommentDto: CreateCommentDto,
    @ActiveUser() userActive: UserActiveInterface,
  ) {
    return this.commentsService.create(createCommentDto, userActive);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los comentarios' })
  @ApiResponse({
    description: 'Ok, se obtienen los comentarios',
    status: 200,
    type: CommentResponseDto,
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
  findAll(@Query(ValidationPipe) pagination: PaginationCommentDto) {
    return this.commentsService.findAll(pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un comentario, indicando su id' })
  @ApiResponse({
    description: 'OK, se obtiene el comentario',
    type: CommentResponseDto,
    status: 200,
  })
  @ApiNotFoundResponse({
    description: 'Id del Comentario no encontrado',
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
    return this.commentsService.findOne(id);
  }

  //obtiene los comentarios de un video
  @Get('video/:videoId')
  @ApiOperation({
    summary:
      'Obtener todos los comentarios de un video, indicando el id del video',
  })
  @ApiResponse({
    description: 'OK, se obtienen los comentarios del video',
    isArray: true,
    type: CommentResponseDto,
    status: 200,
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
  findAllOfVideo(
    @Param('videoId', ParseUUIDPipe) videoId: string,
    @Query(ValidationPipe) pagination: PaginationCommentDto,
  ) {
    return this.commentsService.findAllOfVideo(videoId, pagination);
  }

  //obtiene la lista de comentarios de un usuario
  @Get('user/:userId')
  @ApiOperation({
    summary:
      'Obtener los comentarios realizados por un usuario, indicando el id del usuario',
  })
  @ApiResponse({
    description: 'OK, se obtienen los comentarios del usuario',
    status: 200,
    isArray: true,
    type: CommentUserResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Id de usuario no encontrado',
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
  findUserComments(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query(ValidationPipe) pagination: PaginationUserCommentsDto,
  ) {
    return this.commentsService.findUserComments(userId, pagination);
  }

  @ApiBearerAuth()
  @Auth()
  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar un comentario, indicando su id',
  })
  @ApiUnauthorizedResponse({
    description: 'No autorizado, token no valido / No es su comentario',
    type: UnauthorizedResponseDto,
  })
  @ApiNotFoundResponse({
    description:
      'Id del comentario no encontrado / Video que desea asignar no encontrado',
    type: NotFoundResponsetDto,
  })
  @ApiResponse({
    description: 'Comentario actualizado exitosamente',
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
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @ActiveUser() userActive: UserActiveInterface,
  ) {
    return this.commentsService.update(id, updateCommentDto, userActive);
  }

  @ApiBearerAuth()
  @Auth()
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un comentario, indicando su id' })
  @ApiUnauthorizedResponse({
    description: 'No autorizado, token no valido / No es su comentario',
    type: UnauthorizedResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Id del comentario no encontrado',
    type: NotFoundResponsetDto,
  })
  @ApiResponse({
    description: 'Comentario eliminado exitosamente',
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
    return this.commentsService.remove(id, userActive);
  }
}
