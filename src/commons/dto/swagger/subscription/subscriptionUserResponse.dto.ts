import { UserResponseDto } from '../user/userResponse.dto';

export class SubscriptionUserResponseDto {
  id: string;
  createAt: Date;
  updateAt: Date;
  deleteAt: Date;
  suscriber: UserResponseDto;
}
