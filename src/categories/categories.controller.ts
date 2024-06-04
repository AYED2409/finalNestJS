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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { AuthAdmin } from 'src/auth/decorators/authAdmin.decorator';
import { PaginationCategoryDto } from './dto/pagination-category.dto';
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
import { CategoryResponseDto } from 'src/commons/dto/swagger/category/categoryResponse.dto';
import { ConflictResponseDto } from 'src/commons/dto/swagger/errors/conflictResponse.dto';
import { UnauthorizedResponseDto } from 'src/commons/dto/swagger/errors/unauthorizedResponse.dto';
import { NotFoundResponsetDto } from 'src/commons/dto/swagger/errors/notFoundResponse.dto';
import { BadRequestResponsetDto } from 'src/commons/dto/swagger/errors/badRequestResponse.dto';
import { DeleteUpdateResponseDto } from 'src/commons/dto/swagger/delete-updateResponse.dto';
import { InternalErrorResponsetDto } from 'src/commons/dto/swagger/errors/internalErrorResponse.dto';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @ApiBearerAuth()
  @Auth()
  @Post()
  @ApiOperation({ summary: 'Crear una categoría' })
  @ApiCreatedResponse({
    description: 'Categoría creada exitosamene',
    type: CategoryResponseDto,
  })
  @ApiConflictResponse({
    description: 'Nombre de la categoría ya existe',
    type: ConflictResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'No autorizado, token no valido',
    type: UnauthorizedResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Error producido en el servidor',
    type: InternalErrorResponsetDto,
  })
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las categorias' })
  @ApiResponse({
    description: 'OK, se obtienen las categorias',
    status: 200,
    isArray: true,
    type: CategoryResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Tipo de parametros incorrectos',
    type: BadRequestResponsetDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Error producido en el servidor',
    type: InternalErrorResponsetDto,
  })
  findAll(@Query(ValidationPipe) pagination: PaginationCategoryDto) {
    return this.categoriesService.findAll(pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una categoría, indicando su id' })
  @ApiResponse({
    description: 'OK, se obtiene la categoría',
    status: 200,
    type: CategoryResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Id de la Categoria no encontrada',
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
    return this.categoriesService.findOne(id);
  }

  @ApiBearerAuth()
  @AuthAdmin()
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una categoría' })
  @ApiUnauthorizedResponse({
    description: 'No autorizado, token no valido',
    type: UnauthorizedResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Id de la Categoría no encontrada',
    type: NotFoundResponsetDto,
  })
  @ApiConflictResponse({
    description: 'Nombre de la Categoría al actualizar ya existe',
    type: ConflictResponseDto,
  })
  @ApiResponse({
    description: 'Categoría actualizada correctamente',
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
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @ApiBearerAuth()
  @AuthAdmin()
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una categoria, indicando su id' })
  @ApiUnauthorizedResponse({
    description: 'No autorizado, token no valido',
    type: UnauthorizedResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Id de la Categoría no encontrado',
    type: NotFoundResponsetDto,
  })
  @ApiResponse({
    description: 'Categoría eliminada correctamente',
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
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriesService.remove(id);
  }
}
