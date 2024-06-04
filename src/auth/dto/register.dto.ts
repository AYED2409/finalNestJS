import { Transform } from 'class-transformer';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(4)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  password: string;

  // file: Express.Multer.File;
}
