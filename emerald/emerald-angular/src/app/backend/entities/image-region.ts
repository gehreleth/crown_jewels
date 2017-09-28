export interface IImageRegion {
  readonly href? : string;
  readonly text? : string;
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
      x: dict.x as number,
      y: dict.y as number,
      width: dict.width as number,
      height: dict.height as number
    }
    return retVal;
  }

  export function regionArrayToJson(arg: Array<IImageRegion>): string {
    return JSON.stringify({
        _embedded: {
          imageRegions: arg.map(r => {
            let links = r.href ? { self: { href: r.href } } : null;
            return {
              text: r.text,
              x: r.x,
              y: r.y,
              width: r.width,
              height: r.height,
              _links: links
            }
          })
        }
    });
  }

  export function jsonToRegionArray(dict: any): Array<IImageRegion> {
    return (dict._embedded.imageRegions as any[])
      .map(r => IImageRegion.fromDict(r));
  }
}
