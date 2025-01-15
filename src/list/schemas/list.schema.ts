import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { GameSchema } from '../../game/schemas/game.schema';
import { ListGame } from './list-game.schema';

export type ListDocument = List & Document;

export enum GenreEnum {
    Action = 'Action',
    Adventure = 'Adventure',
    RPG = 'RPG',
    Shooter = 'Shooter',
    Simulation = 'Simulation',
    Sports = 'Sports',
    Strategy = 'Strategy',
    Puzzle = 'Puzzle',
}

export enum SocialStatusEnum {
  Public = 'Public',
  Friends_Only = 'Friends_Only',
  Private = 'Private',
}

export enum ProgressEnum {
  None = 'None',
  Started = 'Started',
  Mid = 'Mid',
  AlmostDone = 'Almost Done',
  Finished = 'Finished',
}

export enum RelevanceEnum {
  High = 'High',
  Mid = 'Mid',
  Low = 'Low'
}

@Schema()
export class List {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({type: String,  required: true, validate: /^[a-zA-Z0-9\s]*$/, })
  name: string;

  @Prop({ type: String, required: true, enum: SocialStatusEnum, default: SocialStatusEnum.Public })
  socialStatus: SocialStatusEnum;

  @Prop({ type: String, required: true, enum: RelevanceEnum, default: RelevanceEnum.Mid })
  relevance: RelevanceEnum;

  @Prop({ type: String, required: true, enum: GenreEnum })
  genre: GenreEnum

  @Prop({ type: String, required: true, enum: ProgressEnum, default: ProgressEnum.None })
  progress: ProgressEnum;

  @Prop({ type: [ListGame], required: true, default: [] }) // Usar el esquema correcto
  games: ListGame[];

  @Prop({ type: Number, required: true })
  gamesCount: number
}

export const ListSchema = SchemaFactory.createForClass(List);
