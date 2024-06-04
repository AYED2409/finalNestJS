import { UserResponseDto } from '../user/userResponse.dto';
import { CategoryResponseDto } from '../category/categoryResponse.dto';

export class VideoCreateResponseDto {
  id: string;
  title: string;
  numLikes: number;
  user: UserResponseDto;
  category: CategoryResponseDto;
  filePath: string;
  deleteAt: Date;
  updateAt: Date;
  createAt: Date;
}
