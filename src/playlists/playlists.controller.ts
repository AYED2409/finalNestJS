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
import { PlaylistsService } from './playlists.service';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ActiveUser } from 'src/commons/decorators/user-active.decorator';
import { UserActiveInterface } from 'src/commons/interfaces/user-active.interface';
import { PaginantionPlaylistDto } from './dto/pagination-playlist.dto';
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
import { UnauthorizedResponseDto } from 'src/commons/dto/swagger/errors/unauthorizedResponse.dto';
import { ConflictResponseDto } from 'src/commons/dto/swagger/errors/conflictResponse.dto';
import { PlaylistCreateResponseDto } from 'src/commons/dto/swagger/playlist/playlistCreateResponse.dto';
import { PlaylistResponseDto } from 'src/commons/dto/swagger/playlist/playlistResponse.dto';
import { DeleteUpdateResponseDto } from 'src/commons/dto/swagger/delete-updateResponse.dto';
import { PlaylistUserResponseDto } from 'src/commons/dto/swagger/playlist/playlistUserResponse.dto';
import { InternalErrorResponsetDto } from 'src/commons/dto/swagger/errors/internalErrorResponse.dto';

@ApiTags('playlists')
@Controller('playlists')
export class PlaylistsController {
  constructor(private readonly playlistsService: PlaylistsService) {}

  @ApiBearerAuth()
  @Auth()
  @Post()
  @ApiOperation({ summary: 'Crear una playlist' })
  @ApiUnauthorizedResponse({
    description: 'No autorizado, token no valido',
    type: UnauthorizedResponseDto,
  })
  @ApiConflictResponse({
    description: 'Ya tiene una playlist con ese nombre',
    type: ConflictResponseDto,
  })
  @ApiCreatedResponse({
    description: 'Playlist creada exitosamente',
    type: PlaylistCreateResponseDto,
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
    @Body() createPlaylistDto: CreatePlaylistDto,
    @ActiveUser() userActive: UserActiveInterface,
  ) {
    return this.playlistsService.create(createPlaylistDto, userActive);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las playlists' })
  @ApiResponse({
    description: 'OK, se obtienen las playlists',
    status: 200,
    isArray: true,
    type: PlaylistResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Tipo de parametros incorrectos',
    type: BadRequestResponsetDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Error producido en el servidor',
    type: InternalErrorResponsetDto,
  })
  findAll(@Query(ValidationPipe) pagination: PaginantionPlaylistDto) {
    return this.playlistsService.findAll(pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una playlist, indicando su id' })
  @ApiNotFoundResponse({
    description: 'Id de la Playlist no encontrada',
    type: NotFoundResponsetDto,
  })
  @ApiResponse({
    description: 'OK, se obtiene la playlist',
    type: PlaylistResponseDto,
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
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.playlistsService.findOne(id);
  }
  //obtener las playlist de un usuario
  @Get('user/:userId')
  @ApiOperation({
    summary: 'Obtener las playlist de un usuario, indicadno el id del usuario',
  })
  @ApiResponse({
    description: 'OK, se obtienen las playlist del usuario',
    status: 200,
    isArray: true,
    type: PlaylistUserResponseDto,
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
  userPlaylists(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query(ValidationPipe) pagination: PaginantionPlaylistDto,
  ) {
    return this.playlistsService.findUserPlaylist(userId, pagination);
  }

  @ApiBearerAuth()
  @Auth()
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una playlist, indicando su id' })
  @ApiUnauthorizedResponse({
    description: 'No autorizado, token no valido / No le pertenece la playlist',
    type: UnauthorizedResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Id de la playlist no encontrado',
    type: NotFoundResponsetDto,
  })
  @ApiConflictResponse({
    description: 'Ya tiene una playlist con ese nombre',
    type: ConflictResponseDto,
  })
  @ApiResponse({
    description: 'Playlist actualizada exitosamente',
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
    @Body() createPlaylistDto: CreatePlaylistDto,
    @ActiveUser() userActive: UserActiveInterface,
  ) {
    return this.playlistsService.update(id, createPlaylistDto, userActive);
  }

  @ApiBearerAuth()
  @Auth()
  @ApiOperation({ summary: 'Eliminar una playlist, indicando su id' })
  @ApiUnauthorizedResponse({
    description: 'No autorizado, token no valido / No es su playlist',
    type: UnauthorizedResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Id de la playlist no encontrado',
    type: NotFoundResponsetDto,
  })
  @ApiResponse({
    description: 'Playlist eliminada exitosamente',
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
  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @ActiveUser() userActive: UserActiveInterface,
  ) {
    return this.playlistsService.remove(id, userActive);
  }
}
