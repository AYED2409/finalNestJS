export class ConflictResponseDto {
  message: string;
  error: string = 'Conflict';
  statusCode: number = 409;
}
