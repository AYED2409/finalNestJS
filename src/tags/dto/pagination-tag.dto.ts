import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { Order } from 'src/commons/enums/orderPagination.enum';

export class PaginationTag {
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
}
