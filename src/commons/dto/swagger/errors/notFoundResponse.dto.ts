export class NotFoundResponsetDto {
  message: string;
  error: string = 'Not Found';
  statusCode: number = 404;
}
