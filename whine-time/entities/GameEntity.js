export class GameEntity {
    constructor(id, type, position, data = {}) {
        this.id = id;
        this.type = type;
        this.position = position;
        this.data = data;
    }
    destroy() {
        if (this.sprite) {
            this.sprite.destroy();
        }
    }
}
//# sourceMappingURL=GameEntity.js.map