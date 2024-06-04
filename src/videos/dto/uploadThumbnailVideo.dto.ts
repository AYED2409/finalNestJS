import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional } from "class-validator";

export class UploadThumbnailVideoDto {

  @ApiProperty({ type: 'string', format: 'binary' })
  thumbnail: Express.Multer.File;

}