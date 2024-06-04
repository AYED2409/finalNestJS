import { TagResponseDto } from '../tag/tagResponse.dto';

export class VideoTagResponseDto {
  id: string;
  createAt: Date;
  updateAt: Date;
  deleteAt: Date;
  tag: TagResponseDto;
}
