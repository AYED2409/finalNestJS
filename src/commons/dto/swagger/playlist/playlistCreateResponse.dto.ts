import { UserResponseDto } from '../user/userResponse.dto';

export class PlaylistCreateResponseDto {
  id: string;
  name: string;
  user: UserResponseDto;
  deleteAt: Date;
  createAt: Date;
}
