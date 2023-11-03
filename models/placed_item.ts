
export interface PlacedItem {
  id: string;
  xStart: number;
  yStart: number;
  xEnd: number;
  yEnd: number;
  visibleWidth: number;
  visibleHeight: number;
  collidableWidth: number;
  collidableHeight: number;
  itemName: string;
  coversTiles: string[];
}
