import { IImageRegion } from '../backend/entities/image-region';

export interface IEditorByselRegion extends IImageRegion {
  readonly num: number,
  readonly active: boolean
};
