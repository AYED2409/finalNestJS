import { UserResponseDto } from '../user/userResponse.dto';

export class CommentResponseDto {
  id: string;
  text: string;
  createAt: Date;
  updateAt: Date;
  deleteAt: Date;
  user: UserResponseDto;
}
