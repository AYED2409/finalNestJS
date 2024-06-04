import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateVideoDto {
  @IsString()
  @MinLength(4)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  title: string;

  @IsString()
  category: string;

  @IsString()
  @MinLength(10)
  @MaxLength(500)
  description: string;

  @ApiProperty({ type: 'string', format: 'binary' })
  file: Express.Multer.File;
}
