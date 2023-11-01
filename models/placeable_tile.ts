
interface PlaceableTile {
  x: number;
  y: number;
  outOfBounds: boolean;
  isDragged: boolean;
  isPlacementOrigin: boolean;
  origin: string|undefined;
  usedFor: string|undefined;
  usedForWidth: number|undefined;
}

