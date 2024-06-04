import { UserResponseDto } from '../user/userResponse.dto';

export class SubscriptionResponseDto {
  id: string;
  deleteAt: Date;
  updateAt: Date;
  createAt: Date;
  user: UserResponseDto;
  suscriber: UserResponseDto;
}
