export class UnauthorizedResponseDto {
  message: string;
  error: string = 'Unauthorized';
  statusCode: number = 401;
}
