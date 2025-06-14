export interface GridPosition {
    x: number;
    y: number;
}
export interface GridItem {
    id: string;
    type: string;
    position: GridPosition;
    sprite?: Phaser.GameObjects.Sprite | Phaser.GameObjects.Rectangle;
    data?: any;
}
export declare class Grid {
    private gridSize;
    private tileSize;
    private width;
    private height;
    private items;
    private grid;
    constructor(width: number, height: number, tileSize?: number);
    getGridSize(): number;
    getTileSize(): number;
    getWidth(): number;
    getHeight(): number;
    worldToGrid(worldX: number, worldY: number): GridPosition;
    gridToWorld(gridX: number, gridY: number): {
        x: number;
        y: number;
    };
    isValidPosition(x: number, y: number): boolean;
    isEmpty(x: number, y: number): boolean;
    placeItem(item: GridItem): boolean;
    removeItem(itemId: string): boolean;
    getItemAt(x: number, y: number): GridItem | null;
    getItem(itemId: string): GridItem | null;
    getAllItems(): GridItem[];
    moveItem(itemId: string, newX: number, newY: number): boolean;
    getAdjacentPositions(x: number, y: number): GridPosition[];
}
//# sourceMappingURL=Grid.d.ts.map