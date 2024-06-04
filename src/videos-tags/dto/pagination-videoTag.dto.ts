import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { OrderBy } from '../enums/orderBy-videosTags.enum';
import { Order } from 'src/commons/enums/orderPagination.enum';

export class PaginationVideosTagsDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  limit: number = 100;

  @IsOptional()
  @IsNumber()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @IsEnum(OrderBy)
  orderBy: OrderBy = OrderBy.tagName;

  @IsOptional()
  @IsEnum(Order)
  order: Order = Order.ASC;
}
