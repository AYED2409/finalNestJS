import { IsOptional, IsNumber, Min, IsEnum } from 'class-validator';
import { Order } from 'src/commons/enums/orderPagination.enum';
import { OrderBy } from '../enums/orderBy-comment.enum';

export class PaginationSubscriptionDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  limit: number = 100;

  @IsOptional()
  @IsEnum(Order)
  order: Order = Order.ASC;

  @IsOptional()
  @IsEnum(OrderBy)
  orderBy: OrderBy = OrderBy.date;
}
