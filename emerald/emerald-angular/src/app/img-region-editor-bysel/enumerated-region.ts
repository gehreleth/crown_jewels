import { IImageRegion } from '../backend/entities/image-region';

export interface IEnumeratedImageRegion extends IImageRegion {
  readonly num: number
};
