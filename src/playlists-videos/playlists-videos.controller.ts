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
import { PlaylistsVideosService } from './playlists-videos.service';
import { CreatePlaylistsVideoDto } from './dto/create-playlists-video.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ActiveUser } from 'src/commons/decorators/user-active.decorator';
import { UserActiveInterface } from 'src/commons/interfaces/user-active.interface';
import { PaginationPlaylistVideo } from './dto/pagination-playlist-video.dto';
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
import { BadRequestResponsetDto } from 'src/commons/dto/swagger/errors/badRequestResponse.dto';
import { NotFoundResponsetDto } from 'src/commons/dto/swagger/errors/notFoundResponse.dto';
import { DeleteUpdateResponseDto } from 'src/commons/dto/swagger/delete-updateResponse.dto';
import { UnauthorizedResponseDto } from 'src/commons/dto/swagger/errors/unauthorizedResponse.dto';
import { PlaylistVideoCreateResponseDto } from 'src/commons/dto/swagger/playlistVideo/playlistVideoCreateResponse.dto';
import { PlaylistVideoResponseDto } from 'src/commons/dto/swagger/playlistVideo/playlistVideoResponse.dto';
import { PlaylistVideoVideoResponseDto } from 'src/commons/dto/swagger/playlistVideo/playlistVideo-VideoResponse.dto';
import { PlaylistVideoIdResponseDto } from 'src/commons/dto/swagger/playlistVideo/playlistVideoIdResponse.dto';
import { InternalErrorResponsetDto } from 'src/commons/dto/swagger/errors/internalErrorResponse.dto';

@ApiTags('playlists-videos')
@Controller('playlists-videos')
export class PlaylistsVideosController {
  constructor(
    private readonly playlistsVideosService: PlaylistsVideosService,
  ) {}

  @ApiBearerAuth()
  @Auth()
  @Post()
  @ApiOperation({ summary: 'Crear una playlist-video' })
  @ApiUnauthorizedResponse({
    description: 'No autorizado, token no valido / No es su playlist',
    type: UnauthorizedResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Playlist no encontrada / Video no encontrado',
    type: NotFoundResponsetDto,
  })
  @ApiCreatedResponse({
    description: 'Playlist-Video creada exitosamente',
    type: PlaylistVideoCreateResponseDto,
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
    @Body() createPlaylistsVideoDto: CreatePlaylistsVideoDto,
    @ActiveUser() userActive: UserActiveInterface,
  ) {
    return this.playlistsVideosService.create(
      createPlaylistsVideoDto,
      userActive,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las playlist-video' })
  @ApiResponse({
    description: 'Obtener todos las Playlist-Video',
    status: 200,
    isArray: true,
    type: PlaylistVideoResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Tipo de parametros incorrectos',
    type: BadRequestResponsetDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Error producido en el servidor',
    type: InternalErrorResponsetDto,
  })
  findAll(@Query(ValidationPipe) pagination: PaginationPlaylistVideo) {
    return this.playlistsVideosService.findAll(pagination);
  }
  //obtiene los videos de una playlist
  @Get('videos/playlist/:playlistId')
  @ApiOperation({
    summary:
      'Obtener los videos de una playlist, indicando el id de la playlist',
  })
  @ApiResponse({
    description: 'OK, se obtienen los videos de la playlist',
    status: 200,
    isArray: true,
    type: PlaylistVideoVideoResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Id de la playlist no encontrada',
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
  findVideosOfAPlaylist(
    @Param('playlistId', ParseUUIDPipe) playlistId: string,
    @Query(ValidationPipe) pagination: PaginationPlaylistVideo,
  ) {
    return this.playlistsVideosService.findVideosOfAPlaylist(
      playlistId,
      pagination,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una playlist-video, indicando su id' })
  @ApiResponse({
    description: 'OK, se obtiene la playlist',
    type: PlaylistVideoIdResponseDto,
    status: 200,
  })
  @ApiNotFoundResponse({
    description: 'Id de la playlist-video no encontrado',
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
    return this.playlistsVideosService.findOne(id);
  }

  @ApiBearerAuth()
  @Auth()
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una playlist-video, indicando su id' })
  @ApiUnauthorizedResponse({
    description: 'No autorizado, token no valido / No es su playlist',
    type: UnauthorizedResponseDto,
  })
  @ApiResponse({
    description: 'Playlist-Video eliminada exitosamente',
    status: 200,
    type: DeleteUpdateResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Id de la Playlist-Video no encontrado',
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
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @ActiveUser() userActive: UserActiveInterface,
  ) {
    return this.playlistsVideosService.remove(id, userActive);
  }
}
