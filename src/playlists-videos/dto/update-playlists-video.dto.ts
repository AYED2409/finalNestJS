import { PartialType } from '@nestjs/mapped-types';
import { CreatePlaylistsVideoDto } from './create-playlists-video.dto';

export class UpdatePlaylistsVideoDto extends PartialType(
  CreatePlaylistsVideoDto,
) {}
