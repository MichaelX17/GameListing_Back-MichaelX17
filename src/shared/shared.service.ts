import { Injectable, BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';

@Injectable()
export class SharedService {
  /**
   * Convierte una cadena de texto a un ObjectId de MongoDB.
   * @param idString La cadena de texto que se desea convertir.
   * @returns Un ObjectId válido.
   * @throws BadRequestException Si la cadena no es un ObjectId válido.
   */
  toObjectId(idString: string) {
    if (!Types.ObjectId.isValid(idString)) {
      throw new BadRequestException(`Bad Request`);
    }
    return new Types.ObjectId(idString);
  }
}
