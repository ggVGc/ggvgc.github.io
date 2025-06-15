/// <reference types="phaser" />
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./SimpleGameScene"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const SimpleGameScene_1 = require("./SimpleGameScene");
    console.log('Starting Whine Time - Baby Care Factory Game...');
    console.log('Phaser version:', Phaser.VERSION);
    const config = {
        type: Phaser.AUTO,
        width: 1024,
        height: 900, // Increased height for UI
        parent: 'game-container',
        backgroundColor: '#87CEEB',
        scene: [SimpleGameScene_1.SimpleGameScene],
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 0, x: 0 },
                debug: false
            }
        },
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            min: {
                width: 800,
                height: 600
            },
            max: {
                width: 1600,
                height: 1200
            }
        }
    };
    console.log('Creating Phaser game with config:', config);
    const game = new Phaser.Game(config);
    console.log('Game created:', game);
    // Export for debugging
    window.game = game;
});
//# sourceMappingURL=index.js.map