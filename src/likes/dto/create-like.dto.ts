import { IsUUID } from 'class-validator';

export class CreateLikeDto {
  @IsUUID()
  idVideo: string;
}
