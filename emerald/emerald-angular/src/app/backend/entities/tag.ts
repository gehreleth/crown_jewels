export interface ITag {
  href?: string,
  name: string,
  description?: string
}

export namespace ITag {
  export function fromDict(arg: any) : ITag {
    const retVal : ITag = {
      href: new URL(arg._links.self.href).pathname,
      name: arg.name,
      description: arg.description
    }
    return retVal
  }

  export function fromEmbedded(arg: any): ITag[] {
    const embedded: any[] = arg._embedded.tags as any[];
    return embedded ? embedded.map(q => ITag.fromDict(q)) : [];
  }
}
