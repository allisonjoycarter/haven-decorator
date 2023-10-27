import type { SunHavenImage } from './image';

export interface CustomSet {
  name: string|undefined;
  roof: SunHavenImage;
  walls: SunHavenImage;
  windows: SunHavenImage;
  door: SunHavenImage;
  patio: SunHavenImage;
}
