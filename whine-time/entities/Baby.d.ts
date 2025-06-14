import { GameEntity, EntityData } from './GameEntity';
import { GridPosition } from '../Grid';
export interface BabyNeeds {
    hunger: number;
    cleanliness: number;
    comfort: number;
    sleepiness: number;
}
export interface BabyData extends EntityData {
    name: string;
    needs: BabyNeeds;
    lastFed: number;
    lastChanged: number;
    isSleeping: boolean;
    age: number;
    specialNeeds?: {
        sensitiveFormula: boolean;
        gasIssues: boolean;
        colicLevel: number;
    };
}
export declare class Baby extends GameEntity {
    data: BabyData;
    constructor(id: string, position: GridPosition, name: string);
    createSprite(scene: Phaser.Scene, x: number, y: number): void;
    update(deltaTime: number): void;
    private getSpriteColor;
    onClick(): void;
    getStatusText(): string;
    feed(feedType: 'breast' | 'formula' | 'sensitiveFormula'): boolean;
    changeDiaper(): boolean;
    comfort(): void;
}
//# sourceMappingURL=Baby.d.ts.map