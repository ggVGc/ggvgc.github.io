import { GameScene } from './scenes/GameScene.js';
import { UIScene } from './scenes/UIScene.js';
console.log('Starting Whine Time game...');
console.log('Phaser version:', Phaser.VERSION);
const config = {
    type: Phaser.AUTO,
    width: 1024,
    height: 768,
    parent: 'game-container',
    backgroundColor: '#87CEEB',
    scene: [GameScene, UIScene],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0, x: 0 },
            debug: false
        }
    }
};
console.log('Creating Phaser game with config:', config);
const game = new Phaser.Game(config);
console.log('Game created:', game);
