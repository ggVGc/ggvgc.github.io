export class Grid {
    constructor(width, height, tileSize = 64) {
        this.width = width;
        this.height = height;
        this.tileSize = tileSize;
        this.gridSize = tileSize;
        this.items = new Map();
        this.grid = Array(height).fill(null).map(() => Array(width).fill(null));
    }
    getGridSize() {
        return this.gridSize;
    }
    getTileSize() {
        return this.tileSize;
    }
    getWidth() {
        return this.width;
    }
    getHeight() {
        return this.height;
    }
    worldToGrid(worldX, worldY) {
        return {
            x: Math.floor(worldX / this.tileSize),
            y: Math.floor(worldY / this.tileSize)
        };
    }
    gridToWorld(gridX, gridY) {
        return {
            x: gridX * this.tileSize + this.tileSize / 2,
            y: gridY * this.tileSize + this.tileSize / 2
        };
    }
    isValidPosition(x, y) {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }
    isEmpty(x, y) {
        if (!this.isValidPosition(x, y))
            return false;
        const row = this.grid[y];
        return row ? row[x] === null : false;
    }
    placeItem(item) {
        const { x, y } = item.position;
        if (!this.isEmpty(x, y))
            return false;
        const row = this.grid[y];
        if (!row)
            return false;
        row[x] = item;
        this.items.set(item.id, item);
        return true;
    }
    removeItem(itemId) {
        const item = this.items.get(itemId);
        if (!item)
            return false;
        const { x, y } = item.position;
        if (this.grid[y]) {
            this.grid[y][x] = null;
        }
        this.items.delete(itemId);
        return true;
    }
    getItemAt(x, y) {
        if (!this.isValidPosition(x, y))
            return null;
        const row = this.grid[y];
        return row ? (row[x] ?? null) : null;
    }
    getItem(itemId) {
        return this.items.get(itemId) ?? null;
    }
    getAllItems() {
        return Array.from(this.items.values());
    }
    moveItem(itemId, newX, newY) {
        const item = this.items.get(itemId);
        if (!item || !this.isEmpty(newX, newY))
            return false;
        const { x: oldX, y: oldY } = item.position;
        if (this.grid[oldY]) {
            this.grid[oldY][oldX] = null;
        }
        if (this.grid[newY]) {
            this.grid[newY][newX] = item;
        }
        item.position = { x: newX, y: newY };
        return true;
    }
    getAdjacentPositions(x, y) {
        const positions = [];
        const directions = [
            { x: 0, y: -1 }, // up
            { x: 1, y: 0 }, // right
            { x: 0, y: 1 }, // down
            { x: -1, y: 0 } // left
        ];
        for (const dir of directions) {
            const newX = x + dir.x;
            const newY = y + dir.y;
            if (this.isValidPosition(newX, newY)) {
                positions.push({ x: newX, y: newY });
            }
        }
        return positions;
    }
}
//# sourceMappingURL=Grid.js.map