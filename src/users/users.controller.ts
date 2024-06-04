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
  UseInterceptors,
  UploadedFile,
  Header,
  StreamableFile,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthAdmin } from 'src/auth/decorators/authAdmin.decorator';
import { PaginationUserDto } from './dto/pagination-user.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiConsumes,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UserResponseDto } from 'src/commons/dto/swagger/user/userResponse.dto';
import { UserWithPasswordResponseDto } from 'src/commons/dto/swagger/user/userWithPasswordResponse.dto';
import { BadRequestResponsetDto } from 'src/commons/dto/swagger/errors/badRequestResponse.dto';
import { ConflictResponseDto } from 'src/commons/dto/swagger/errors/conflictResponse.dto';
import { UnauthorizedResponseDto } from 'src/commons/dto/swagger/errors/unauthorizedResponse.dto';
import { NotFoundResponsetDto } from 'src/commons/dto/swagger/errors/notFoundResponse.dto';
import { DeleteUpdateResponseDto } from 'src/commons/dto/swagger/delete-updateResponse.dto';
import { InternalErrorResponsetDto } from 'src/commons/dto/swagger/errors/internalErrorResponse.dto';
import { ActiveUser } from 'src/commons/decorators/user-active.decorator';
import { UserActiveInterface } from 'src/commons/interfaces/user-active.interface';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadImageProfileDto } from './dto/uploadImageProfile.dto';
import { createReadStream } from 'fs';
import { Response } from 'express';
import { join } from 'path';
import * as fs from 'fs';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @ApiBearerAuth()
  @AuthAdmin()
  @Post()
  @ApiOperation({ summary: 'Crear un usuario' })
  @ApiCreatedResponse({
    description: 'Usuario creado exitosamente',
    type: UserWithPasswordResponseDto,
  })
  @ApiConflictResponse({
    description: 'Email existente / Username existente',
    type: ConflictResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'No autorizado, token no valido',
    type: UnauthorizedResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Tipo de parametros incorrectos',
    type: BadRequestResponsetDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Error producido en el servidor',
    type: InternalErrorResponsetDto,
  })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
  @ApiBearerAuth()
  @AuthAdmin()
  @Get()
  @ApiOperation({ summary: 'Obtener todos los usuarios' })
  @ApiUnauthorizedResponse({
    description: 'No autorizado, token no valido',
    type: UnauthorizedResponseDto,
  })
  @ApiResponse({
    description: 'OK, se obtienen los usuarios',
    status: 200,
    type: UserResponseDto,
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
  findAll(@Query(ValidationPipe) pagination: PaginationUserDto) {
    return this.usersService.findAll(pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtner un usuario, indicando su id' })
  @ApiResponse({
    description: 'OK, usuario obtenido exitosamente',
    status: 200,
    type: UserResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Id del usuario no encontrado',
    type: NotFoundResponsetDto,
  })
  @ApiUnauthorizedResponse({
    description: 'No autorizado, token no valido',
    type: UnauthorizedResponseDto,
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
    return this.usersService.findOne(id);
  }
  @ApiBearerAuth()
  // @AuthAdmin()
  @Auth()
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar datos de un usuario, indicando su id' })
  @ApiNotFoundResponse({
    description: ' Id del usuario no encontrado',
    type: NotFoundResponsetDto,
  })
  @ApiBadRequestResponse({
    description: 'Tipo de parametros incorrectos',
    type: BadRequestResponsetDto,
  })
  @ApiResponse({
    description: 'Usuario actualizado correctamente',
    status: 200,
    type: DeleteUpdateResponseDto,
  })
  @ApiConflictResponse({
    description: 'Username / Email ya existentes al actualizar.',
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
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @ActiveUser() userActive: UserActiveInterface,
  ) {
    return this.usersService.update(id, updateUserDto, userActive);
  }
  @ApiBearerAuth()
  @AuthAdmin()
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un usuario, indicando su id' })
  @ApiNotFoundResponse({
    description: 'Id del usuario no encontrado',
    type: NotFoundResponsetDto,
  })
  @ApiResponse({
    description: 'Usuario borrado correctamente',
    status: 200,
    type: DeleteUpdateResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'No autorizado, token no valido',
    type: UnauthorizedResponseDto,
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
    return this.usersService.remove(id);
  }

  @ApiBearerAuth()
  @Auth()
  @Post('/image')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Subir foto de perfil' })
  @ApiCreatedResponse({
    description: 'Imagen subida exitosamente',
    type: UploadImageProfileDto,
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
  @UseInterceptors(FileInterceptor('image'))
  uploadImage(
    @ActiveUser() userActive: UserActiveInterface,
    @UploadedFile() file,
    @Body() uploadProfile: UploadImageProfileDto,
  ) {
    // console.log(file);
    return this.usersService.uploadImage(userActive, file);
  }

  // @Get('imageUser/:id')
  // @Header('Content-Type', 'application/json')
  // @Header('Content-Disposition', 'attachment; filename="package.json"')
  // getImageUser(@Param('id', ParseUUIDPipe) id: string) {
  //   return this.usersService.getImagProfile(id);
  // }
  @Get('imageUser/:idUser')
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
  async getImage(
    @Param('idUser', ParseUUIDPipe) idUser: string,
    @Res() res: Response,
  ) {
    // console.log(process.cwd);
    const user = await this.usersService.findOneById(idUser);
    if (!user) {
      throw new BadRequestException('Usuario no encontrado');
    }
    if (!user.image) {
      throw new BadRequestException('Usuario sin  imagen');
    }
    return res.sendFile(
      join(process.cwd(), `/uploads/${idUser}/image/image-profile.jpeg`),
    );
  }
}
