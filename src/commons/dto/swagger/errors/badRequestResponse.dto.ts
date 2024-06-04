export class BadRequestResponsetDto {
  message: string;
  error: string = 'Bad Request';
  statusCode: number = 400;
}
