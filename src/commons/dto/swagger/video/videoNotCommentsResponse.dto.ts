import { CategoryResponseDto } from '../category/categoryResponse.dto';
import { UserResponseDto } from '../user/userResponse.dto';

export class VideoNotCommentsResponseDto {
  id: string;
  title: string;
  numLikes: number;
  filePath: string;
  deleteAt: Date;
  updateAt: Date;
  createAt: Date;
  category: CategoryResponseDto;
  user: UserResponseDto;
}
