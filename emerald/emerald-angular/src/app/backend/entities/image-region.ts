export enum RegionStatus { Default, HighUncertainty, LowUncertainty, HumanVerified };

export interface IImageRegion {
  readonly href? : string;
  readonly text? : string;
  readonly status? : RegionStatus;
  readonly x : number;
  readonly y : number;
  readonly width : number;
  readonly height : number;
}

export namespace IImageRegion {
  export function fromDict(dict: any): IImageRegion {
    const retVal : IImageRegion = {
      href: new URL(dict._links.self.href).pathname,
      text: dict.text as string,
      status: RegionStatus[dict.status as string],
      x: dict.x as number,
      y: dict.y as number,
      width: dict.width as number,
      height: dict.height as number
    }
    return retVal;
  }

  export function jsonToRegionArray(dict: any): Array<IImageRegion> {
    return (dict._embedded.imageRegions as any[])
      .map(r => IImageRegion.fromDict(r));
  }
}
