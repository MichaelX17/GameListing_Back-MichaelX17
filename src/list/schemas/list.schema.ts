import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Game, GameSchema } from '../../game/schemas/game.schema';

export type ListDocument = List & Document;

enum GenreEnum {
    Action = 'Action',
    Adventure = 'Adventure',
    RPG = 'RPG',
    Shooter = 'Shooter',
    Simulation = 'Simulation',
    Sports = 'Sports',
    Strategy = 'Strategy',
    Puzzle = 'Puzzle',
}

enum StatusEnum {
  Public = 'Public',
  Friends_Only = 'Friends_Only',
  Private = 'Private',
}

enum ProgressEnum {
  None = 'None',
  Started = 'Started',
  Mid = 'Mid',
  Finished = 'Finished',
}

@Schema()
export class List {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({type: String,  required: true, validate: /^[a-zA-Z0-9\s]*$/, })
  name: string;

  @Prop({ type: Number, required: true, min: 0 })
  order: number;

  @Prop({ type: String, required: true, enum: StatusEnum })
  status: StatusEnum;

  @Prop({ type: String, required: true, enum: ProgressEnum })
  progress: ProgressEnum;

  @Prop({ type: String, required: true, enum: GenreEnum })
  genre: GenreEnum

  @Prop({ type: [GameSchema], required: true, default: [] })
  games: Game[];
}

export const ListSchema = SchemaFactory.createForClass(List);
