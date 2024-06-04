import { UserResponseDto } from '../user/userResponse.dto';

export class SubscriptionCreateResponseDto {
  id: string;
  suscriber: UserResponseDto;
  user: UserResponseDto;
  deleteAt: Date;
  updateAt: Date;
  createAt: Date;
}
