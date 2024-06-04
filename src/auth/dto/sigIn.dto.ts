import { IsEmail, IsString, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';
export class SigIn {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  password: string;
}
