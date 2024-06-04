import { Transform } from 'class-transformer';
import { IsString, IsUUID, MinLength } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @MinLength(4)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  text: string;

  @IsUUID()
  idVideo: string;
}
