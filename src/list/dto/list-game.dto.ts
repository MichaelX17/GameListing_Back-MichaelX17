import {
    IsString,
    IsEnum,
    IsArray,
    IsNotEmpty,
    ValidateNested,
  } from 'class-validator';
  import { Type } from 'class-transformer';
  import { Types } from 'mongoose';
  
  enum ProgressEnum {
    None = 'None',
    Started = 'Started',
    Mid = 'Mid',
    AlmostDone = 'Almost Done',
    Finished = 'Finished',
  }
  
  export class ListGameDto {
    @IsNotEmpty({ each: true }) // Cada elemento no debe estar vacío
    @ValidateNested({ each: true }) // Valida cada ID en el array
    @Type(() => String) // Transforma a strings para que sean compatibles con MongoId
    gameId: Types.ObjectId; // Array de IDs de MongoDB
  
    @IsEnum(ProgressEnum) // Asegura que el valor pertenece al Enum definido
    @IsNotEmpty() // No permite valores vacíos
    progress: ProgressEnum; // Estado del progreso
  }
  