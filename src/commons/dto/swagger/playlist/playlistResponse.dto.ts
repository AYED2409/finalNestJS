import { UserResponseDto } from '../user/userResponse.dto';

export class PlaylistResponseDto {
  id: string;
  name: string;
  createAt: Date;
  deleteAt: Date;
  user: UserResponseDto;
}
