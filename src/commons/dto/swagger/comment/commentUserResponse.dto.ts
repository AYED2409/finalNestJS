import { VideoNotCommentsResponseDto } from '../video/videoNotCommentsResponse.dto';

export class CommentUserResponseDto {
  id: string;
  text: string;
  createAt: Date;
  updateAt: Date;
  deleteAt: Date;
  video: VideoNotCommentsResponseDto;
}
