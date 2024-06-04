import { UserResponseDto } from '../user/userResponse.dto';
import { VideoResponseDto } from '../video/videoResponse.dto';

export class CommentCreateResponseDto {
  id: string;
  text: string;
  user: UserResponseDto;
  video: VideoResponseDto;
  deleteAt: Date;
  createAt: Date;
  updateAt: Date;
}
