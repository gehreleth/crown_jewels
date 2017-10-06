import { IImageMeta, Rotation } from '../backend/entities/image-meta';
import { IRect } from './rect';

export default function getBlobUrl(imageMeta: IImageMeta, rect?: IRect): string {
  if (!rect) {
    return  '/emerald/blobs/' + `${imageMeta.aquamarineId}`
      + `?rot=${Rotation[imageMeta.rotation]}`
  } else {
    return  '/emerald/blobs/' + `${imageMeta.aquamarineId}`
      + `?rot=${Rotation[imageMeta.rotation]}`
      + `&x=${rect.x}&y=${rect.y}&width=${rect.width}&height=${rect.height}`
  }
}
