export interface IPageRange {
  page: number;
  count: number;
  numPages?: number;
  otherRouteParams?: Map<string, string>;
  itemsOnPage?: Array<any>;
}
