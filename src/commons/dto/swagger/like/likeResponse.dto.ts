import { UserResponseDto } from '../user/userResponse.dto';
import { VideoResponseDto } from '../video/videoResponse.dto';

export class LikeResponseDto {
  id: string;
  createAt: Date;
  updateAt: Date;
  deleteAt: Date;
  user: UserResponseDto;
  video: VideoResponseDto;
}
