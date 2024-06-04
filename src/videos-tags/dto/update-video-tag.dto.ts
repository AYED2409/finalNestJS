import { PartialType } from '@nestjs/mapped-types';
import { CreateVideoTagDto } from './create-video-tag.dto';

export class UpdateVideoTagDto extends PartialType(CreateVideoTagDto) {}
