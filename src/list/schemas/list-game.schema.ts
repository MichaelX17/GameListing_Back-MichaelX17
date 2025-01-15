import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Game, GameSchema } from '../../game/schemas/game.schema';

export type ListGameDocument = ListGame & Document;

export enum ProgressEnum {
  None = 'None',
  Started = 'Started',
  Mid = 'Mid',
  AlmostDone = 'Almost Done',
  Finished = 'Finished',
}

@Schema()
export class ListGame {
  @Prop({ type: Types.ObjectId, ref: 'Game', required: true })
  gameId: Types.ObjectId;

  @Prop({ type: String, required: true, enum: ProgressEnum, default: ProgressEnum.None })
  progress: ProgressEnum;
}

export const ListSchema = SchemaFactory.createForClass(ListGame);
