import { IsUUID } from 'class-validator';

export class CreateVideoTagDto {
  @IsUUID()
  idVideo: string;

  @IsUUID()
  idTag: string;
}
