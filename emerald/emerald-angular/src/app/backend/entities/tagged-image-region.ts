import { IImageRegion } from './image-region';
import { ITag } from './tag';

export interface ITaggedImageRegion extends IImageRegion {
  tags: Array<ITag>
};
