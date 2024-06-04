import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
  ParseUUIDPipe,
  NotFoundException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Express } from 'express';
import { VideosService } from '../videos.service';
import { CategoriesService } from 'src/categories/categories.service';

@Injectable()
export class ValidFileInterceptor implements NestInterceptor {
  constructor(
    private readonly videosService: VideosService,
    private readonly categoriesService: CategoriesService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    let resposeOk = true;
    const request = context.switchToHttp().getRequest<Express.Request>(); //Request de Express (contiene el fichero)
    const reqUser = context.switchToHttp().getRequest(); //Request que contiene el usuario inyectado
    const userId = reqUser.user.id;
    const file: Express.Multer.File = request.file; // Contiene el archivo desde la solicitud
    const date = new Date();
    const prefix = `${date.getTime()}`;
    request['prefix'] = prefix;

    const doFile = async () => {
      await this.videosService.createFile(userId, file, prefix);
    };

    //---------------METODO PATCH
    if (reqUser.method === 'PATCH') {
      const param = reqUser.params.id;
      const paramId = await new ParseUUIDPipe().transform(param, undefined);
      if (!(await this.videosService.existVideo(paramId))) {
        throw new NotFoundException('The video ID does not exist to edit');
      }
      if (file !== undefined) {
        const buffer: Buffer = file.buffer;
        if (!this.videosService.isValidVideoMagicNumber(buffer)) {
          throw new BadRequestException(
            ' Only files with mp4 or webm extension are allowed',
          );
        }
      }
      if (
        file === undefined ||
        reqUser.body.title === undefined ||
        reqUser.body.category === undefined ||
        reqUser.body.description == undefined
      ) {
        return next.handle();
      }
    }
    //-------------METODO POST
    if (!file) {
      resposeOk = false;
      throw new BadRequestException('File not inserted');
    }
    //Validacion de los parmetros del Request (solo permitir que se pasen title, category y description) para subir archivo
    if (reqUser.body.title?.length < 4 || reqUser.body.title == null) {
      resposeOk = false;
      throw new BadRequestException(
        'It must indicate a title and it must be longer than 4 characters',
      );
    }
    const category = await this.categoriesService.findOneByName(
      reqUser.body.category,
    );
    if (!category || reqUser.body.category == null) {
      resposeOk = false;
      throw new NotFoundException(
        'A category has not been entered or the indicated category does not exist',
      );
    }
    const description = reqUser.body.description;

    if (
      !description ||
      reqUser.body.description == null ||
      reqUser.body.description.length < 10
    ) {
      resposeOk = false;
      throw new NotFoundException(
        'No description has been entered and must contain more than 10 characters',
      );
    }
    const propCreateVideo = ['title', 'category', 'description'];
    const propBody = Object.keys(reqUser.body);
    propBody.map((prop) => {
      const res = propCreateVideo.find((propVideo) => propVideo === prop);
      if (res === undefined) {
        resposeOk = false;
        throw new BadRequestException(
          `The ${prop} property does not exist when creating the video`,
        );
      }
    });
    //Realizar validacion del fichero (tamaño y tipo)
    const buffer: Buffer = file.buffer;
    if (!this.videosService.isValidVideoMagicNumber(buffer)) {
      resposeOk = false;
      throw new BadRequestException(
        ' Only files with mp4 or webm extension are allowed',
      );
    }
    if (file.size > 200000000) {
      resposeOk = false;
      throw new BadRequestException('Your file exceeds the allowed 2GB');
    }
    // creacion del fichero
    if (resposeOk) {
      doFile();
      return next.handle();
    }
  }
}
