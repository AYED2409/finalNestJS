import { VideoNotCommentsResponseDto} from '../video/videoNotCommentsResponse.dto';

export class PlaylistVideoVideoResponseDto {
  id: string;
  createAT: Date;
  deleteAt: Date;
  video: VideoNotCommentsResponseDto;
}
