import { CategoryResponseDto } from '../category/categoryResponse.dto';
import { CommentResponseDto } from '../comment/commentResponse.dto';
import { UserResponseDto } from '../user/userResponse.dto';

export class VideoResponseDto {
  id: string;
  title: string;
  numLikes: number;
  filePath: string;
  deleteAt: Date;
  updateAt: Date;
  createAt: Date;
  category: CategoryResponseDto;
  description: string;
  user: UserResponseDto;
  comments: CommentResponseDto[];
}
