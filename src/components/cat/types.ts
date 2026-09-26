export type CatBehaviorState =
  | 'idle'
  | 'walking'
  | 'eating'
  | 'beingPetted'
  | 'playing'
  | 'fallingAsleep'
  | 'sleeping'
  | 'wakingUp';

export type RoomTarget = 'rug' | 'bowl' | 'cushion' | 'play';

export interface RoomCoordinate {
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
}

// Fixed semantic spots in the room coordinate system
export const ROOM_COORDINATES: Record<RoomTarget, RoomCoordinate> = {
  rug: { x: 50, y: 64 },      // Center of cozy rug
  bowl: { x: 67, y: 73 },     // Right in front of pink food bowl
  cushion: { x: 80, y: 62 },  // On top of sage cushion
  play: { x: 38, y: 66 },     // Sunbeam playing spot near plant
};

export type RenderMode = 'original' | 'modular-svg';

export interface CatAnimationStatus {
  currentState: CatBehaviorState;
  targetLocation: RoomTarget;
  isBusy: boolean;
  actionLabel?: string;
  facing: 'left' | 'right';
}
