import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from './entities/subscription.entity';
import * as uuid from 'uuid';
import { UsersService } from 'src/users/users.service';
import { UserActiveInterface } from 'src/commons/interfaces/user-active.interface';
import { User } from 'src/users/entities/user.entity';
import { PaginationSubscriptionDto } from './dto/pagination-subscription.dto';
import { OrderBy } from './enums/orderBy-comment.enum';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    private readonly usersService: UsersService,
  ) {}

  async create(
    createSubscriptionDto: CreateSubscriptionDto,
    userActive: UserActiveInterface,
  ) {
    const id = uuid.v4();
    const user = await this.usersService.findOne(
      createSubscriptionDto.idSubscribedTo,
    );
    const subscriber = await this.usersService.findOne(userActive.id);
    await this.isSubscribed(subscriber, user);
    return await this.subscriptionRepository.save({
      id,
      subscriber,
      user,
    });
  }

  async findAll(pagination: PaginationSubscriptionDto) {
    const { page, limit, order, orderBy } = pagination;
    const skip = (page - 1) * limit;
    const orderValue = this.getValueOrderByObject(orderBy, order);
    return await this.subscriptionRepository.find({
      relations: ['user'],
      take: limit,
      skip: skip,
      order: orderValue,
    });
  }

  async findOne(id: string) {
    const subscription = await this.subscriptionRepository.findOneBy({ id });
    if (!subscription) {
      throw new NotFoundException(
        'The subscription with the indicated id was not found',
      );
    }
    return subscription;
  }

  async isSubscribed(myUser: User, SubscribeToUser: User) {
    const idUser = SubscribeToUser.id;
    const idSubscriber = myUser.id;
    const subscription = await this.subscriptionRepository
      .createQueryBuilder('subscription')
      .where('subscription.user.id = :idUser', { idUser })
      .andWhere('subscription.subscriber.id = :idSubscriber', { idSubscriber })
      .getOne();
    if (subscription instanceof Subscription) {
      throw new ConflictException(
        'is already subscribed to the indicated user',
      );
    }
    return subscription;
  }

  async remove(id: string, userActive: UserActiveInterface) {
    const subscription = await this.findOne(id);
    if (subscription.subscriber.id !== userActive.id) {
      throw new UnauthorizedException(
        'You are not authorized to delete this subscription',
      );
    }
    return await this.subscriptionRepository.softDelete(id);
  }

  async unsubscribe(idSubscribedTo: string, userActive: UserActiveInterface) {
    await this.usersService.findOne(idSubscribedTo);
    const idSubscriber = userActive.id;
    const subscription = await this.subscriptionRepository
      .createQueryBuilder('subscription')
      .where('subscription.user.id = :idSubscribedTo', { idSubscribedTo })
      .andWhere('subscription.subscriber = :idSubscriber', { idSubscriber })
      .getOne();
    if (subscription instanceof Subscription) {
      return await this.subscriptionRepository.softDelete(subscription.id);
    }
    throw new BadRequestException('the user is not subscribed');
  }

  async findSubscribersQuery(
    idUser: string,
    pagination: PaginationSubscriptionDto,
  ) {
    await this.usersService.findOne(idUser);
    const { page, limit, order, orderBy } = pagination;
    const orderValue = this.getValueOrderBy(orderBy);
    const skip = (page - 1) * limit;
    const query = await this.subscriptionRepository
      .createQueryBuilder('subscription')
      .innerJoinAndSelect('subscription.subscriber', 'user')
      .orderBy(orderValue, order)
      .where('subscription.user = :idUser', { idUser })
      .skip(skip)
      .take(limit)
      .getMany();
    return query;
  }

  async findSubscriptionsQuery(
    idUser: string,
    pagination: PaginationSubscriptionDto,
  ) {
    await this.usersService.findOne(idUser);
    const { page, limit, order, orderBy } = pagination;
    const orderValue = this.getValueOrderBy(orderBy);
    const skip = (page - 1) * limit;
    const query = await this.subscriptionRepository
      .createQueryBuilder('subscription')
      .innerJoinAndSelect('subscription.user', 'user')
      .orderBy(orderValue, order)
      .where('subscription.subscriber = :idUser', { idUser })
      .skip(skip)
      .take(limit)
      .getMany();
    return query;
  }

  getValueOrderBy(orderBy: string) {
    let res: string;
    switch (orderBy) {
      case OrderBy.date:
        res = 'subscription.createAt';
        break;
      case OrderBy.userName:
        res = 'user.username';
        break;
      case OrderBy.id:
        res = 'subscription.id';
        break;
      case OrderBy.userId:
        res = 'user.id';
        break;
      default:
        res = 'subscription.createAt';
    }
    return res;
  }

  getValueOrderByObject(orderBy: string, order: string) {
    let value;
    switch (orderBy) {
      case OrderBy.date:
        value = { createAt: order };
        break;
      case OrderBy.id:
        value = { id: order };
        break;
      case OrderBy.userId:
        value = { user: { id: order } };
        break;
      case OrderBy.userName:
        value = { user: { username: order } };
        break;
      default:
        value = { createAt: order };
    }
    return value;
  }
}
