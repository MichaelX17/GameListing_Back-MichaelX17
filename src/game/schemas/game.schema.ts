import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type GameDocument = Game & Document;

export enum ProgressEnum {
  None = 'None',
  InProgress = 'InProgress',
  Finished = 'Finished',
}

@Schema()
export class Game extends Document {
  @Prop({ type: Types.ObjectId }) // Asegúrate de que sea Types.ObjectId
  _id: Types.ObjectId;

  @Prop({ required: true })
  rawgId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  rating: number;

  @Prop({ required: true })
  released: string;

  @Prop({ required: true })
  average: number;

  @Prop({ required: true })
  playtime: number;

  @Prop({ required: true })
  background_image: string;

  @Prop({ required: true })
  background_image_additional: string;

  @Prop({ type: [] })
  genres: string[];

  @Prop({ type: [] })
  developers: string[];
}

export const GameSchema = SchemaFactory.createForClass(Game);
