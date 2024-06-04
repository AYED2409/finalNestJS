import { PlaylistResponseDto } from '../playlist/playlistResponse.dto';
import { VideoResponseDto } from '../video/videoResponse.dto';

export class PlaylistVideoIdResponseDto {
  id: string;
  createAt: Date;
  deleteAt: Date;
  video: VideoResponseDto;
  playlist: PlaylistResponseDto;
}
