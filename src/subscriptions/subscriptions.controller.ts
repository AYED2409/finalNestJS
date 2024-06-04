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
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ActiveUser } from 'src/commons/decorators/user-active.decorator';
import { UserActiveInterface } from 'src/commons/interfaces/user-active.interface';
import { PaginationSubscriptionDto } from './dto/pagination-subscription.dto';
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
import { UnauthorizedResponseDto } from 'src/commons/dto/swagger/errors/unauthorizedResponse.dto';
import { ConflictResponseDto } from 'src/commons/dto/swagger/errors/conflictResponse.dto';
import { SubscriptionCreateResponseDto } from 'src/commons/dto/swagger/subscription/subscriptionCreateResponse.dto';
import { SubscriptionResponseDto } from 'src/commons/dto/swagger/subscription/subscriptionResponse.dto';
import { SubscriptionUserResponseDto } from 'src/commons/dto/swagger/subscription/subscriptionUserResponse.dto';
import { SubscriptionUserIdResponseDto } from 'src/commons/dto/swagger/subscription/subscriptionUserIdResponse.dto';
import { InternalErrorResponsetDto } from 'src/commons/dto/swagger/errors/internalErrorResponse.dto';

@ApiTags('subscriptions')
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @ApiBearerAuth()
  @Auth()
  @Post()
  @ApiOperation({ summary: 'Suscribirse a un usuario' })
  @ApiCreatedResponse({
    description: 'Suscripcion creada exitosamente',
    type: SubscriptionCreateResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Usuario al que se desea suscribir no encontrado',
    type: NotFoundResponsetDto,
  })
  @ApiConflictResponse({
    description: 'Ya se encuentra suscrito al usuario',
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
  create(
    @Body() createSubscriptionDto: CreateSubscriptionDto,
    @ActiveUser() userActive: UserActiveInterface,
  ) {
    return this.subscriptionsService.create(createSubscriptionDto, userActive);
  }

  // obtiene subscriptores del usuario indicado en idUser
  @Get('user/:userId/subscribers/')
  @ApiOperation({
    summary:
      'Obtener los suscriptores de un usuario, indicando el id del usuario',
  })
  @ApiResponse({
    description: 'OK, se obtienen los suscriptores',
    status: 200,
    isArray: true,
    type: SubscriptionUserResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Id del usuario no encontrado',
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
  findSubscribersQuery(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query(ValidationPipe) pagination: PaginationSubscriptionDto,
  ) {
    return this.subscriptionsService.findSubscribersQuery(userId, pagination);
  }

  //obtiene los usuarios a los que esta suscrito un usuario
  @Get('user/:userId/subscriptions/')
  @ApiOperation({
    summary:
      'Obtener las suscripciones de un usuario, indicando el id del usuario',
  })
  @ApiResponse({
    status: 200,
    description: 'OK, se obtienen las suscripciones',
    isArray: true,
    type: SubscriptionUserIdResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Id de Usuario no encontrado',
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
  findSubscriptionsQuery(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query(ValidationPipe) pagination: PaginationSubscriptionDto,
  ) {
    return this.subscriptionsService.findSubscriptionsQuery(userId, pagination);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las suscripciones' })
  @ApiResponse({
    description: 'OK, se obtienen las suscripciones',
    isArray: true,
    type: SubscriptionResponseDto,
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
  findAll(@Query(ValidationPipe) pagination: PaginationSubscriptionDto) {
    return this.subscriptionsService.findAll(pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una suscripción, indicando su id' })
  @ApiResponse({
    description: 'OK, se obtiene la suscripcion',
    status: 200,
    type: SubscriptionResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Id de la suscripcion no encontrada',
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
    return this.subscriptionsService.findOne(id);
  }

  @ApiBearerAuth()
  @Auth()
  @Delete('unsubscribe/:idSubscribedTo')
  @ApiOperation({
    summary:
      'Eliminar una suscripción, indicando el id del usuario al que se anulará la suscripción.',
  })
  @ApiUnauthorizedResponse({
    description: 'No autorizado, token no valido',
    type: UnauthorizedResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Id del usuario al que se desea dessuscribir no se encontro',
    type: NotFoundResponsetDto,
  })
  @ApiBadRequestResponse({
    description:
      'No se encuentra suscrito al usuario / Tipo de parametros incorrecto',
    type: BadRequestResponsetDto,
  })
  @ApiResponse({
    description: 'Se ha dado de baja correctamente',
    status: 200,
    type: DeleteUpdateResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Error producido en el servidor',
    type: InternalErrorResponsetDto,
  })
  unsuscribe(
    @Param('idSubscribedTo', ParseUUIDPipe) idSubscribedTo: string,
    @ActiveUser() userActive: UserActiveInterface,
  ) {
    return this.subscriptionsService.unsubscribe(idSubscribedTo, userActive);
  }

  @ApiBearerAuth()
  @Auth()
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una suscripción, indicando su id' })
  @ApiUnauthorizedResponse({
    description: 'No autorizado, token no valido / No es su suscripción',
    type: UnauthorizedResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Id de la Suscripción no encontrada',
    type: NotFoundResponsetDto,
  })
  @ApiResponse({
    description: 'Suscripcion eliminada exitosamente',
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
    return this.subscriptionsService.remove(id, userActive);
  }
}
