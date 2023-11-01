
interface PlaceableTile {
  x: number;
  y: number;
  isDragged: boolean;
  isPlacementOrigin: boolean;
  origin: string|undefined;
  usedFor: string|undefined;
  usedForWidth: number|undefined;
}

