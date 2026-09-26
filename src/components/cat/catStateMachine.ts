import { CatBehaviorState, RoomTarget, ROOM_COORDINATES, RoomCoordinate } from './types';

// Allowable transitions mapping
const ALLOWED_TRANSITIONS: Record<CatBehaviorState, CatBehaviorState[]> = {
  idle: ['walking', 'beingPetted', 'playing', 'fallingAsleep'],
  walking: ['idle', 'eating', 'fallingAsleep', 'playing'],
  eating: ['idle', 'walking'],
  beingPetted: ['idle'],
  playing: ['idle'],
  fallingAsleep: ['sleeping', 'wakingUp'],
  sleeping: ['wakingUp'],
  wakingUp: ['idle', 'walking'],
};

export class CatStateMachine {
  public static canTransition(from: CatBehaviorState, to: CatBehaviorState): boolean {
    if (from === to) return true;
    return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
  }

  public static getTargetCoordinates(target: RoomTarget): RoomCoordinate {
    return ROOM_COORDINATES[target] || ROOM_COORDINATES.rug;
  }

  public static getActionLabel(state: CatBehaviorState): string | undefined {
    switch (state) {
      case 'walking':
        return 'Yürüyor...';
      case 'eating':
        return 'Mama yiyor...';
      case 'beingPetted':
        return 'Seviliyor...';
      case 'playing':
        return 'Oynuyor...';
      case 'fallingAsleep':
        return 'Kıvrılıyor...';
      case 'sleeping':
        return 'Uyuyor... (Zzz)';
      case 'wakingUp':
        return 'Uyanıyor...';
      default:
        return undefined;
    }
  }

  public static isBusy(state: CatBehaviorState): boolean {
    return state === 'walking' || state === 'eating' || state === 'beingPetted' || state === 'fallingAsleep' || state === 'wakingUp';
  }
}
