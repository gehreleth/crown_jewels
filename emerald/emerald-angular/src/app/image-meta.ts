import { IImageRegion } from './image-region'

export enum Rotation {
  NONE = 0, CW90 = 1, CW180 = 2,
  CW270 = 3, CCW90 = -1, CCW180 = -2,
  CCW270 = -3
};

export namespace Rotation {
  export function toString(arg: Rotation) : string {
    return Rotation[arg];
  }

  export function fromNumber(arg: number) : Rotation  {
    return (arg % 4) as Rotation;
  }

  export function rotateCW(arg: Rotation) : Rotation  {
    return fromNumber((arg as number) + 1);
  }

  export function rotateCCW(arg: Rotation) : Rotation  {
    return fromNumber((arg as number) - 1);
  }
}

export interface IImageMeta {
  readonly imageHref : string;
  readonly rotation: Rotation;
  readonly regions: ReadonlyArray<IImageRegion>;
}
