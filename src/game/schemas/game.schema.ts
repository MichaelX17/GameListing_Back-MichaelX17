import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type GameDocument = Game & Document;

export enum ProgressEnum {
  None = 'None',
  Started = 'Started',
  Mid = 'Mid',
  Finished = 'Finished',
}

@Schema()
export class Game {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  rating: number;

  @Prop({ required: true })
  hours: number;

  @Prop({ required: true })
  average: number;

  @Prop({ type: String, required: true, enum: ProgressEnum })
  progress: ProgressEnum;
}

export const GameSchema = SchemaFactory.createForClass(Game);
