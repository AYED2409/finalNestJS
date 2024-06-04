import { Transform } from 'class-transformer';
import { IsString, MinLength } from 'class-validator';

export class CreatePlaylistDto {
  @IsString()
  @MinLength(4)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  name: string;
}
