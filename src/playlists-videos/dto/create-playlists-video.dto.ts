import { IsUUID } from 'class-validator';

export class CreatePlaylistsVideoDto {
  @IsUUID()
  idVideo: string;

  @IsUUID()
  idPlaylist: string;
}
