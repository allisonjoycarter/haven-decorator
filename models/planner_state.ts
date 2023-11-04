import type { PlacedItem } from "./placed_item";

export default interface PlannerState {
  mapName: string;
  tileData: any;
  subtileData: PlacedItem[];
}
