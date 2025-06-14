import { GameState } from '../GameState.js';
export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }
    create() {
        console.log('GameScene create() called');
        this.gameState = new GameState();
        // Set up the room background
        this.add.rectangle(512, 384, 1024, 768, 0xF5DEB3); // Wheat color for room
        // Add furniture
        this.add.rectangle(100, 200, 150, 100, 0x8B4513).setStrokeStyle(2, 0x654321); // Crib
        this.add.rectangle(900, 600, 200, 100, 0x654321).setStrokeStyle(2, 0x4A4A4A); // Bed
        this.add.rectangle(300, 700, 150, 50, 0x8B4513).setStrokeStyle(2, 0x654321); // Table
        // Create baby sprite (simple rectangle for now)
        this.baby = this.add.rectangle(100, 200, 30, 30, 0xFFB6C1);
        this.baby.setInteractive();
        this.baby.on('pointerdown', () => this.onBabyClick());
        // Create player sprite
        this.player = this.add.rectangle(400, 400, 40, 60, 0x4169E1);
        // Add labels
        this.add.text(50, 150, 'Crib', { fontSize: '16px', color: '#000000' });
        this.add.text(850, 550, 'Your Bed', { fontSize: '16px', color: '#000000' });
        this.add.text(250, 680, 'Table', { fontSize: '16px', color: '#000000' });
        // Start UI scene
        this.scene.launch('UIScene', { gameState: this.gameState });
        // Game loop
        this.time.addEvent({
            delay: 100,
            callback: this.updateGame,
            callbackScope: this,
            loop: true
        });
    }
    updateGame() {
        this.gameState.updateNeeds(100);
        this.gameState.updateLeaveStatus();
        // Check win/lose conditions
        if (this.gameState.checkGameOver()) {
            this.showGameOverScreen();
            return;
        }
        if (this.gameState.checkWinCondition()) {
            this.showWinScreen();
            return;
        }
        // Update baby appearance based on needs
        const baby = this.gameState.babies[0];
        if (baby.needs.hunger > 80 || baby.needs.cleanliness < 20) {
            this.baby.setFillStyle(0xFF6B6B); // Red when unhappy
        }
        else if (baby.needs.hunger < 30 && baby.needs.cleanliness > 80) {
            this.baby.setFillStyle(0x98FB98); // Light green when happy
        }
        else {
            this.baby.setFillStyle(0xFFB6C1); // Pink normal state
        }
        // Update player appearance based on needs
        if (this.gameState.playerNeeds.hunger > 80 || this.gameState.playerNeeds.tiredness > 80) {
            this.player.setFillStyle(0xFF6B6B); // Red when struggling
        }
        else {
            this.player.setFillStyle(0x4169E1); // Blue normal state
        }
    }
    showGameOverScreen() {
        const overlay = this.add.rectangle(512, 384, 1024, 768, 0x000000, 0.8);
        const gameOverText = this.add.text(512, 300, 'GAME OVER', {
            fontSize: '48px',
            color: '#FF0000',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        const reasonText = this.add.text(512, 380, 'You failed to take care of yourself or the baby!', {
            fontSize: '24px',
            color: '#FFFFFF'
        }).setOrigin(0.5);
        const restartButton = this.add.text(512, 450, 'Restart Game', {
            fontSize: '20px',
            color: '#FFFFFF',
            backgroundColor: '#4CAF50',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive().on('pointerdown', () => {
            this.scene.restart();
        });
    }
    showWinScreen() {
        const overlay = this.add.rectangle(512, 384, 1024, 768, 0x000000, 0.8);
        const winText = this.add.text(512, 300, 'YOU WIN!', {
            fontSize: '48px',
            color: '#00FF00',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        const congratsText = this.add.text(512, 380, 'You successfully stayed on leave and took care of your baby!', {
            fontSize: '20px',
            color: '#FFFFFF'
        }).setOrigin(0.5);
        const playAgainButton = this.add.text(512, 450, 'Play Again', {
            fontSize: '20px',
            color: '#FFFFFF',
            backgroundColor: '#4CAF50',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive().on('pointerdown', () => {
            this.scene.restart();
        });
    }
    onBabyClick() {
        const baby = this.gameState.babies[0];
        // Simple AI to determine what the baby needs most
        const needs = baby.needs;
        const maxNeed = Math.max(needs.hunger, 100 - needs.cleanliness, 100 - needs.comfort);
        if (maxNeed === needs.hunger && needs.hunger > 50) {
            this.feedBaby();
        }
        else if (maxNeed === 100 - needs.cleanliness && needs.cleanliness < 50) {
            this.changeDiaper();
        }
        else {
            this.comfortBaby();
        }
    }
    feedBaby() {
        const success = this.gameState.feedBaby('1', 'formula');
        if (success) {
            this.showMessage('Fed the baby!');
        }
        else {
            this.showMessage('No formula available!');
        }
    }
    changeDiaper() {
        const success = this.gameState.changeDiaper('1');
        if (success) {
            this.showMessage('Changed diaper!');
        }
        else {
            this.showMessage('No diapers available!');
        }
    }
    comfortBaby() {
        const baby = this.gameState.babies[0];
        baby.needs.comfort = Math.min(100, baby.needs.comfort + 20);
        this.showMessage('Comforted the baby!');
    }
    showMessage(text) {
        const message = this.add.text(512, 50, text, {
            fontSize: '24px',
            color: '#000000',
            backgroundColor: '#FFFFFF',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5);
        this.time.delayedCall(2000, () => {
            message.destroy();
        });
    }
    getGameState() {
        return this.gameState;
    }
}
