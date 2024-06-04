import { TagResponseDto } from '../tag/tagResponse.dto';
import { VideoResponseDto } from '../video/videoResponse.dto';

export class VideoTagCreateResponseDto {
  id: string;
  createAt: Date;
  updateAt: Date;
  deleteAt: Date;
  video: VideoResponseDto;
  tag: TagResponseDto;
}
