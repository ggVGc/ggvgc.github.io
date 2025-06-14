import { GameEntity, EntityData } from './GameEntity';
import { GridPosition } from '../Grid';
export interface FeedingStationData extends EntityData {
    formulaType: 'regular' | 'sensitive';
    formulaAmount: number;
    needsCleaning: boolean;
    usesBeforeCleaning: number;
    maxUses: number;
    waterLevel: number;
    maxWater: number;
}
export declare class FeedingStation extends GameEntity {
    data: FeedingStationData;
    constructor(id: string, position: GridPosition, formulaType?: 'regular' | 'sensitive');
    createSprite(scene: Phaser.Scene, x: number, y: number): void;
    update(deltaTime: number): void;
    onClick(): void;
    getStatusText(): string;
    makeFormula(): boolean;
    clean(): boolean;
    refillWater(): boolean;
    takeFormula(): boolean;
}
//# sourceMappingURL=FeedingStation.d.ts.map