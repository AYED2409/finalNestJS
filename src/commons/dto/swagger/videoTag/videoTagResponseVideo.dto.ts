import { VideoResponseDto } from '../video/videoResponse.dto';

export class VideoTagResponseVideoDto {
  id: string;
  createAt: Date;
  updateAt: Date;
  deleteAt: Date;
  video: VideoResponseDto;
}
