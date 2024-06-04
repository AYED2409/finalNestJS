import { Post, Body, Controller, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SigIn } from './dto/sigIn.dto';
import { RegisterDto } from './dto/register.dto';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { LoginResponseDto } from 'src/commons/dto/swagger/login/loginResponse.dto';
import { UnauthorizedResponseDto } from 'src/commons/dto/swagger/errors/unauthorizedResponse.dto';
import { BadRequestResponsetDto } from 'src/commons/dto/swagger/errors/badRequestResponse.dto';
import { ConflictResponseDto } from 'src/commons/dto/swagger/errors/conflictResponse.dto';
import { UserWithPasswordResponseDto } from 'src/commons/dto/swagger/user/userWithPasswordResponse.dto';
import { InternalErrorResponsetDto } from 'src/commons/dto/swagger/errors/internalErrorResponse.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Realizar login en App' })
  @ApiResponse({
    description: 'Usuario logueado exitosamente',
    status: 200,
    type: LoginResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Credenciales invalidas',
    type: UnauthorizedResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Usuario no registrado / Tipo de parametros incorrectos',
    type: BadRequestResponsetDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Error producido en el servidor',
    type: InternalErrorResponsetDto,
  })
  login(@Body() sigIn: SigIn) {
    return this.authService.sigIn(sigIn);
  }

  @Post('register')
  @ApiOperation({ summary: 'Registrarse en la App' })
  @ApiConflictResponse({
    description: 'Username / Email ya existentes',
    type: ConflictResponseDto,
  })
  @ApiCreatedResponse({
    description: 'Usuario registrado exitosamente',
    type: UserWithPasswordResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Tipo de parametros incorrectos',
    type: BadRequestResponsetDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Error producido en el servidor',
    type: InternalErrorResponsetDto,
  })
  register(@Body() registerdto: RegisterDto) {
    return this.authService.register(registerdto);
  }
}
