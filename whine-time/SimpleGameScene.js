import Phaser from 'phaser';
export class SimpleGameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SimpleGameScene' });
        this.gridSize = 64;
        this.gridWidth = 16;
        this.gridHeight = 12;
        this.resources = {
            money: 500,
            diapers: 20,
            formula: 10,
            food: 10
        };
        this.placementMode = null;
        this.entities = new Map();
    }
    create() {
        console.log('SimpleGameScene create() called');
        // Draw grid
        this.drawGrid();
        // Create UI
        this.createUI();
        // Place initial entities
        this.placeInitialEntities();
        // Set up input
        this.setupInput();
        // Start game loop
        this.gameTimer = this.time.addEvent({
            delay: 1000,
            callback: this.updateGame,
            callbackScope: this,
            loop: true
        });
    }
    drawGrid() {
        this.grid = this.add.graphics();
        this.grid.lineStyle(1, 0xCCCCCC, 0.5);
        // Draw background
        this.add.rectangle((this.gridWidth * this.gridSize) / 2, (this.gridHeight * this.gridSize) / 2, this.gridWidth * this.gridSize, this.gridHeight * this.gridSize, 0xF5F5DC, 0.3);
        // Draw grid lines
        for (let x = 0; x <= this.gridWidth; x++) {
            this.grid.moveTo(x * this.gridSize, 0);
            this.grid.lineTo(x * this.gridSize, this.gridHeight * this.gridSize);
        }
        for (let y = 0; y <= this.gridHeight; y++) {
            this.grid.moveTo(0, y * this.gridSize);
            this.grid.lineTo(this.gridWidth * this.gridSize, y * this.gridSize);
        }
        this.grid.strokePath();
    }
    createUI() {
        const uiY = this.gridHeight * this.gridSize + 10;
        // Status text
        this.statusText = this.add.text(10, uiY, 'Click on entities to interact', {
            fontSize: '16px',
            color: '#000000',
            backgroundColor: '#FFFFFF',
            padding: { x: 10, y: 5 }
        });
        // Resource display
        this.resourceText = this.add.text(10, uiY + 40, '', {
            fontSize: '14px',
            color: '#000000',
            backgroundColor: '#FFFFFF',
            padding: { x: 10, y: 5 }
        });
        // Placement buttons
        const buttonY = uiY + 80;
        let buttonX = 10;
        const placeBabyBtn = this.add.text(buttonX, buttonY, 'Place Baby', {
            fontSize: '12px',
            color: '#FFFFFF',
            backgroundColor: '#4CAF50',
            padding: { x: 8, y: 4 }
        }).setInteractive();
        placeBabyBtn.on('pointerdown', () => {
            this.placementMode = 'baby';
            this.showMessage('Click on grid to place baby');
        });
        buttonX += 100;
        const placeHumanBtn = this.add.text(buttonX, buttonY, 'Place Human', {
            fontSize: '12px',
            color: '#FFFFFF',
            backgroundColor: '#4CAF50',
            padding: { x: 8, y: 4 }
        }).setInteractive();
        placeHumanBtn.on('pointerdown', () => {
            this.placementMode = 'human';
            this.showMessage('Click on grid to place human');
        });
        buttonX += 100;
        const cancelBtn = this.add.text(buttonX, buttonY, 'Cancel', {
            fontSize: '12px',
            color: '#FFFFFF',
            backgroundColor: '#FF4444',
            padding: { x: 8, y: 4 }
        }).setInteractive();
        cancelBtn.on('pointerdown', () => {
            this.placementMode = null;
            this.showMessage('Placement cancelled');
        });
        this.updateResourceDisplay();
    }
    placeInitialEntities() {
        // Place initial baby
        this.createBaby(2, 2, 'Emma');
        // Place initial human
        this.createHuman(4, 4, 'Sarah');
    }
    createBaby(gridX, gridY, name) {
        const worldX = gridX * this.gridSize + this.gridSize / 2;
        const worldY = gridY * this.gridSize + this.gridSize / 2;
        const baby = this.add.rectangle(worldX, worldY, 48, 48, 0xFFB6C1);
        baby.setStrokeStyle(2, 0x000000);
        baby.setInteractive();
        baby.setData('type', 'baby');
        baby.setData('name', name);
        baby.setData('hunger', 60);
        baby.setData('happiness', 70);
        baby.on('pointerdown', () => this.interactWithBaby(baby));
        this.entities.set(`baby_${gridX}_${gridY}`, baby);
        // Add name label
        this.add.text(worldX, worldY - 30, name, {
            fontSize: '12px',
            color: '#000000'
        }).setOrigin(0.5);
    }
    createHuman(gridX, gridY, name) {
        const worldX = gridX * this.gridSize + this.gridSize / 2;
        const worldY = gridY * this.gridSize + this.gridSize / 2;
        const human = this.add.rectangle(worldX, worldY, 40, 60, 0xFF69B4);
        human.setStrokeStyle(2, 0x000000);
        human.setInteractive();
        human.setData('type', 'human');
        human.setData('name', name);
        human.setData('hunger', 50);
        human.setData('tiredness', 30);
        human.on('pointerdown', () => this.interactWithHuman(human));
        this.entities.set(`human_${gridX}_${gridY}`, human);
        // Add name label
        this.add.text(worldX, worldY - 40, name, {
            fontSize: '12px',
            color: '#000000'
        }).setOrigin(0.5);
    }
    setupInput() {
        this.input.on('pointerdown', (pointer) => {
            if (this.placementMode) {
                const gridX = Math.floor(pointer.x / this.gridSize);
                const gridY = Math.floor(pointer.y / this.gridSize);
                if (gridX >= 0 && gridX < this.gridWidth && gridY >= 0 && gridY < this.gridHeight) {
                    this.handlePlacement(gridX, gridY);
                }
            }
        });
    }
    handlePlacement(gridX, gridY) {
        const key = `${this.placementMode}_${gridX}_${gridY}`;
        if (this.entities.has(key)) {
            this.showMessage('Space occupied!');
            return;
        }
        switch (this.placementMode) {
            case 'baby':
                const babyCount = Array.from(this.entities.keys()).filter(k => k.startsWith('baby_')).length;
                this.createBaby(gridX, gridY, `Baby ${babyCount + 1}`);
                this.showMessage(`Placed baby at ${gridX}, ${gridY}`);
                break;
            case 'human':
                const humanCount = Array.from(this.entities.keys()).filter(k => k.startsWith('human_')).length;
                this.createHuman(gridX, gridY, `Human ${humanCount + 1}`);
                this.showMessage(`Placed human at ${gridX}, ${gridY}`);
                break;
        }
        this.placementMode = null;
    }
    interactWithBaby(baby) {
        const name = baby.getData('name');
        const hunger = baby.getData('hunger');
        const happiness = baby.getData('happiness');
        this.statusText.setText(`${name} - Hunger: ${hunger}, Happiness: ${happiness}`);
        if (hunger > 70) {
            this.feedBaby(baby);
        }
        else {
            this.comfortBaby(baby);
        }
    }
    interactWithHuman(human) {
        const name = human.getData('name');
        const hunger = human.getData('hunger');
        const tiredness = human.getData('tiredness');
        this.statusText.setText(`${name} - Hunger: ${hunger}, Tiredness: ${tiredness}`);
        if (hunger > 70 && this.resources.food > 0) {
            human.setData('hunger', Math.max(0, hunger - 40));
            this.resources.food--;
            this.showMessage(`${name} ate food!`);
            this.updateResourceDisplay();
        }
        else {
            this.showMessage(`${name} is ready to work!`);
        }
    }
    feedBaby(baby) {
        if (this.resources.formula > 0) {
            const hunger = baby.getData('hunger');
            baby.setData('hunger', Math.max(0, hunger - 50));
            baby.setData('happiness', Math.min(100, baby.getData('happiness') + 20));
            this.resources.formula--;
            const name = baby.getData('name');
            this.showMessage(`Fed ${name}!`);
            this.updateResourceDisplay();
            // Update baby color
            baby.setFillStyle(0x98FB98); // Light green when fed
        }
        else {
            this.showMessage('No formula available!');
        }
    }
    comfortBaby(baby) {
        const happiness = baby.getData('happiness');
        baby.setData('happiness', Math.min(100, happiness + 15));
        const name = baby.getData('name');
        this.showMessage(`Comforted ${name}!`);
        // Update baby color
        baby.setFillStyle(0x98FB98); // Light green when comforted
    }
    updateGame() {
        // Update all entities
        this.entities.forEach((entity) => {
            const type = entity.getData('type');
            if (type === 'baby') {
                const hunger = entity.getData('hunger');
                const happiness = entity.getData('happiness');
                // Babies get hungry over time
                entity.setData('hunger', Math.min(100, hunger + 5));
                // Update baby color based on state
                if (hunger > 80) {
                    entity.setFillStyle(0xFF6B6B); // Red when very hungry
                }
                else if (hunger < 30 && happiness > 70) {
                    entity.setFillStyle(0x98FB98); // Light green when happy
                }
                else {
                    entity.setFillStyle(0xFFB6C1); // Pink normal state
                }
            }
            else if (type === 'human') {
                const hunger = entity.getData('hunger');
                const tiredness = entity.getData('tiredness');
                // Humans get hungry and tired over time
                entity.setData('hunger', Math.min(100, hunger + 2));
                entity.setData('tiredness', Math.min(100, tiredness + 1));
                // Update human color based on state
                if (hunger > 80 || tiredness > 80) {
                    entity.setFillStyle(0xFF6B6B); // Red when struggling
                }
                else {
                    entity.setFillStyle(0xFF69B4); // Pink normal state
                }
            }
        });
    }
    updateResourceDisplay() {
        const text = `Money: $${this.resources.money} | Diapers: ${this.resources.diapers} | Formula: ${this.resources.formula} | Food: ${this.resources.food}`;
        this.resourceText.setText(text);
    }
    showMessage(text) {
        // Remove existing message
        this.children.getChildren().forEach(child => {
            if (child.getData && child.getData('isMessage')) {
                child.destroy();
            }
        });
        const message = this.add.text(512, 50, text, {
            fontSize: '20px',
            color: '#000000',
            backgroundColor: '#FFFF99',
            padding: { x: 15, y: 8 }
        }).setOrigin(0.5).setData('isMessage', true);
        this.time.delayedCall(3000, () => {
            if (message && message.active) {
                message.destroy();
            }
        });
    }
}
//# sourceMappingURL=SimpleGameScene.js.map