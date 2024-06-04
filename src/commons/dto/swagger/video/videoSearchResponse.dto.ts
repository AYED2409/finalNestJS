import { CategoryResponseDto } from '../category/categoryResponse.dto';
import { UserResponseDto } from '../user/userResponse.dto';
import { VideoTagResponseDto } from '../videoTag/videoTag-TagResponse.dto';

export class VideoSearchResponseDto {
  id: string;
  title: string;
  numLikes: number;
  filePath: string;
  deleteAt: Date;
  updateAt: Date;
  createAt: Date;
  user: UserResponseDto;
  category: CategoryResponseDto;
  videoTags: VideoTagResponseDto[];
}
