import { UserResponseDto } from '../user/userResponse.dto';

export class SubscriptionUserIdResponseDto {
  id: string;
  createAt: Date;
  updateAt: Date;
  deleteAt: Date;
  user: UserResponseDto;
}
