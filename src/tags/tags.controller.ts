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
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ActiveUser } from 'src/commons/decorators/user-active.decorator';
import { UserActiveInterface } from 'src/commons/interfaces/user-active.interface';
import { AuthAdmin } from 'src/auth/decorators/authAdmin.decorator';
import { PaginationTag } from './dto/pagination-tag.dto';
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
import { ConflictResponseDto } from 'src/commons/dto/swagger/errors/conflictResponse.dto';
import { BadRequestResponsetDto } from 'src/commons/dto/swagger/errors/badRequestResponse.dto';
import { TagResponseDto } from 'src/commons/dto/swagger/tag/tagResponse.dto';
import { NotFoundResponsetDto } from 'src/commons/dto/swagger/errors/notFoundResponse.dto';
import { DeleteUpdateResponseDto } from 'src/commons/dto/swagger/delete-updateResponse.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { InternalErrorResponsetDto } from 'src/commons/dto/swagger/errors/internalErrorResponse.dto';

@ApiTags('tags')
@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @ApiBearerAuth()
  @Auth()
  @Post()
  @ApiOperation({ summary: 'Crear una etiqueta' })
  @ApiUnauthorizedResponse({
    description: 'No autorizado, token no valido',
    type: UnauthorizedResponseDto,
  })
  @ApiCreatedResponse({
    description: 'Tag creado exitosamente',
    type: TagResponseDto,
  })
  @ApiConflictResponse({
    description: 'Ya existe un tag con ese nombre',
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
  create(@Body() createTagDto: CreateTagDto) {
    return this.tagsService.create(createTagDto);
  }

  //obtener los tags ordenados por nombre
  @Get()
  @ApiOperation({ summary: 'Obtener todas las etiquetas' })
  @ApiResponse({
    description: 'Ok, se obtienen los tags',
    status: 200,
    isArray: true,
    type: TagResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Tipo de parametros incorrectos',
    type: BadRequestResponsetDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Error producido en el servidor',
    type: InternalErrorResponsetDto,
  })
  findAll(@Query(ValidationPipe) pagination: PaginationTag) {
    return this.tagsService.findAll(pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una etiqueta, indicando su id' })
  @ApiResponse({
    description: 'Ok, se obtiene el tag',
    status: 200,
    type: TagResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Id del Tag no encontrado',
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
    return this.tagsService.findOne(id);
  }

  @ApiBearerAuth()
  @AuthAdmin()
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una etiqueta, indicando su id' })
  @ApiUnauthorizedResponse({
    description: 'No autorizado, token no valido',
    type: UnauthorizedResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Id del Tag no encontrado',
    type: NotFoundResponsetDto,
  })
  @ApiResponse({
    description: 'Tag actualizado exitosamente',
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
    @Body() updateTagDto: UpdateTagDto,
    @ActiveUser() userActive: UserActiveInterface,
  ) {
    return this.tagsService.update(id, updateTagDto, userActive);
  }

  @ApiBearerAuth()
  @AuthAdmin()
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una etiqueta, indicando su id' })
  @ApiResponse({
    description: 'OK, tag eliminado exitosamente',
    status: 200,
    type: DeleteUpdateResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'No autorizado, token no valido',
    type: UnauthorizedResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Id del Tag no encontrado',
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
    return this.tagsService.remove(id, userActive);
  }
}
