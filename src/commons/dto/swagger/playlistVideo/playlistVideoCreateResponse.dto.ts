import { PlaylistResponseDto } from '../playlist/playlistResponse.dto';
import { VideoResponseDto } from '../video/videoResponse.dto';

export class PlaylistVideoCreateResponseDto {
  id: string;
  video: VideoResponseDto;
  playlist: PlaylistResponseDto;
  deleteAt: Date;
  createAt: Date;
}
