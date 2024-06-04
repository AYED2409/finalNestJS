import { PartialType } from '@nestjs/mapped-types';
import { CreateSubscriptionDto } from './create-subscription.dto';

export class UpdateSuscriptionDto extends PartialType(CreateSubscriptionDto) {}
