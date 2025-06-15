(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GameEntity = void 0;
    class GameEntity {
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
    exports.GameEntity = GameEntity;
});
//# sourceMappingURL=GameEntity.js.map