import { UserResponseDto } from '../user/userResponse.dto';
import { VideoResponseDto } from '../video/videoResponse.dto';

export class LikeCreateResponseDto {
  id: string;
  video: VideoResponseDto;
  user: UserResponseDto;
  deleteAt: Date;
  updateAt: Date;
  createAt: Date;
}
