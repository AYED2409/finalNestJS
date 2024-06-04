import { ApiProperty } from '@nestjs/swagger';

export class UploadImageProfileDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  image: Express.Multer.File;
}
