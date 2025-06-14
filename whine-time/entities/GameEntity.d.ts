import { GridPosition } from '../Grid';
export interface EntityData {
    [key: string]: any;
}
export declare abstract class GameEntity {
    id: string;
    type: string;
    position: GridPosition;
    sprite?: Phaser.GameObjects.Sprite | Phaser.GameObjects.Rectangle;
    data: EntityData;
    constructor(id: string, type: string, position: GridPosition, data?: EntityData);
    abstract createSprite(scene: Phaser.Scene, x: number, y: number): void;
    abstract update(deltaTime: number): void;
    abstract onClick(): void;
    abstract getStatusText(): string;
    destroy(): void;
}
//# sourceMappingURL=GameEntity.d.ts.map