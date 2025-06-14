import Phaser from 'phaser';
import { Grid } from '../Grid';
import { Baby } from '../entities/Baby';
import { Human } from '../entities/Human';
import { FeedingStation } from '../entities/FeedingStation';
export class MainGameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainGameScene' });
        this.selectedEntity = null;
        this.placementMode = null;
        // Game resources
        this.resources = {
            money: 500,
            diapers: 20,
            formula: 10,
            sensitiveFormula: 5,
            bottles: 5,
            food: 10
        };
    }
    create() {
        console.log('MainGameScene create() called');
        // Initialize grid (16x12 tiles, 64px each)
        this.grid = new Grid(16, 12, 64);
        // Draw grid background
        this.drawGrid();
        // Create UI
        this.createUI();
        // Place initial entities
        this.placeInitialEntities();
        // Set up input handlers
        this.setupInputHandlers();
        // Start game loop
        this.gameTimer = this.time.addEvent({
            delay: 100,
            callback: this.updateGame,
            callbackScope: this,
            loop: true
        });
    }
    drawGrid() {
        const graphics = this.add.graphics();
        graphics.lineStyle(1, 0xCCCCCC, 0.5);
        const tileSize = this.grid.getTileSize();
        const width = this.grid.getWidth();
        const height = this.grid.getHeight();
        // Draw vertical lines
        for (let x = 0; x <= width; x++) {
            graphics.moveTo(x * tileSize, 0);
            graphics.lineTo(x * tileSize, height * tileSize);
        }
        // Draw horizontal lines
        for (let y = 0; y <= height; y++) {
            graphics.moveTo(0, y * tileSize);
            graphics.lineTo(width * tileSize, y * tileSize);
        }
        graphics.strokePath();
        // Add background
        this.add.rectangle((width * tileSize) / 2, (height * tileSize) / 2, width * tileSize, height * tileSize, 0xF5F5DC, 0.3);
    }
    createUI() {
        const uiY = this.grid.getHeight() * this.grid.getTileSize() + 10;
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
        this.createPlacementButtons(uiY);
        this.updateResourceDisplay();
    }
    createPlacementButtons(yPos) {
        const buttonY = yPos + 100;
        const buttonSpacing = 120;
        let buttonX = 10;
        const buttons = [
            { text: 'Place Baby', mode: 'baby', cost: 0 },
            { text: 'Place Human', mode: 'human', cost: 0 },
            { text: 'Feeding Station', mode: 'feeding_station', cost: 200 },
            { text: 'Sensitive FS', mode: 'sensitive_feeding_station', cost: 300 }
        ];
        buttons.forEach(button => {
            const btn = this.add.text(buttonX, buttonY, button.text, {
                fontSize: '12px',
                color: '#FFFFFF',
                backgroundColor: '#4CAF50',
                padding: { x: 8, y: 4 }
            }).setInteractive();
            btn.on('pointerdown', () => {
                if (button.cost > 0 && this.resources.money < button.cost) {
                    this.showMessage('Not enough money!');
                    return;
                }
                this.placementMode = button.mode;
                this.showMessage(`Click on grid to place ${button.text}`);
            });
            buttonX += buttonSpacing;
        });
        // Cancel placement button
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
    }
    placeInitialEntities() {
        // Place initial baby
        const baby = new Baby('baby1', { x: 2, y: 2 }, 'Emma');
        this.placeEntity(baby);
        // Place initial human (female for breastfeeding)
        const human = new Human('human1', { x: 4, y: 4 }, 'Sarah', 'female');
        this.placeEntity(human);
        // Place a feeding station
        const feedingStation = new FeedingStation('fs1', { x: 6, y: 2 });
        this.placeEntity(feedingStation);
    }
    placeEntity(entity) {
        if (!this.grid.placeItem({
            id: entity.id,
            type: entity.type,
            position: entity.position,
            data: entity.data
        })) {
            return false;
        }
        const worldPos = this.grid.gridToWorld(entity.position.x, entity.position.y);
        entity.createSprite(this, worldPos.x, worldPos.y);
        return true;
    }
    setupInputHandlers() {
        this.input.on('pointerdown', (pointer) => {
            const gridPos = this.grid.worldToGrid(pointer.x, pointer.y);
            if (this.placementMode) {
                this.handlePlacement(gridPos);
            }
            else {
                this.handleSelection(gridPos);
            }
        });
    }
    handlePlacement(gridPos) {
        if (!this.grid.isValidPosition(gridPos.x, gridPos.y) || !this.grid.isEmpty(gridPos.x, gridPos.y)) {
            this.showMessage('Cannot place here!');
            return;
        }
        let entity = null;
        let cost = 0;
        switch (this.placementMode) {
            case 'baby':
                const babyCount = this.grid.getAllItems().filter(item => item.type === 'baby').length;
                entity = new Baby(`baby${babyCount + 1}`, gridPos, `Baby ${babyCount + 1}`);
                break;
            case 'human':
                const humanCount = this.grid.getAllItems().filter(item => item.type === 'human').length;
                const gender = Math.random() < 0.5 ? 'male' : 'female';
                entity = new Human(`human${humanCount + 1}`, gridPos, `Human ${humanCount + 1}`, gender);
                break;
            case 'feeding_station':
                const fsCount = this.grid.getAllItems().filter(item => item.type === 'feeding_station').length;
                entity = new FeedingStation(`fs${fsCount + 1}`, gridPos, 'regular');
                cost = 200;
                break;
            case 'sensitive_feeding_station':
                const sfsCount = this.grid.getAllItems().filter(item => item.type === 'feeding_station').length;
                entity = new FeedingStation(`sfs${sfsCount + 1}`, gridPos, 'sensitive');
                cost = 300;
                break;
        }
        if (entity && this.placeEntity(entity)) {
            this.resources.money -= cost;
            this.updateResourceDisplay();
            this.showMessage(`Placed ${this.placementMode}!`);
            this.placementMode = null;
        }
        else {
            this.showMessage('Failed to place entity!');
        }
    }
    handleSelection(gridPos) {
        const item = this.grid.getItemAt(gridPos.x, gridPos.y);
        if (item) {
            this.selectedEntity = this.getEntityFromItem(item);
            if (this.selectedEntity) {
                this.showEntityStatus(this.selectedEntity);
                this.handleEntityInteraction(this.selectedEntity);
            }
        }
        else {
            this.selectedEntity = null;
            this.showMessage('Click on entities to interact');
        }
    }
    getEntityFromItem(item) {
        // This would normally involve a proper entity registry
        // For now, we'll create entities on the fly based on type
        switch (item.type) {
            case 'baby':
                const baby = new Baby(item.id, item.position, item.data?.name || 'Baby');
                baby.data = item.data;
                return baby;
            case 'human':
                const human = new Human(item.id, item.position, item.data?.name || 'Human', item.data?.gender || 'female');
                human.data = item.data;
                return human;
            case 'feeding_station':
                const fs = new FeedingStation(item.id, item.position, item.data?.formulaType || 'regular');
                fs.data = item.data;
                return fs;
        }
        return null;
    }
    handleEntityInteraction(entity) {
        if (entity instanceof Baby) {
            this.handleBabyInteraction(entity);
        }
        else if (entity instanceof Human) {
            this.handleHumanInteraction(entity);
        }
        else if (entity instanceof FeedingStation) {
            this.handleFeedingStationInteraction(entity);
        }
    }
    handleBabyInteraction(baby) {
        const needs = baby.data.needs;
        if (needs.hunger > 70) {
            this.feedBaby(baby);
        }
        else if (needs.cleanliness < 30) {
            this.changeBabyDiaper(baby);
        }
        else {
            baby.comfort();
            this.showMessage(`Comforted ${baby.data.name}!`);
        }
    }
    feedBaby(baby) {
        const needsSensitive = baby.data.specialNeeds?.sensitiveFormula;
        if (needsSensitive && this.resources.sensitiveFormula > 0) {
            baby.feed('sensitiveFormula');
            this.resources.sensitiveFormula--;
            this.showMessage(`Fed ${baby.data.name} with sensitive formula!`);
        }
        else if (this.resources.formula > 0) {
            baby.feed('formula');
            this.resources.formula--;
            this.showMessage(`Fed ${baby.data.name} with formula!`);
        }
        else {
            this.showMessage('No formula available!');
        }
        this.updateResourceDisplay();
    }
    changeBabyDiaper(baby) {
        if (this.resources.diapers > 0) {
            baby.changeDiaper();
            this.resources.diapers--;
            this.showMessage(`Changed ${baby.data.name}'s diaper!`);
            this.updateResourceDisplay();
        }
        else {
            this.showMessage('No diapers available!');
        }
    }
    handleHumanInteraction(human) {
        if (human.data.needs.hunger > 70 && this.resources.food > 0) {
            human.eat();
            this.resources.food--;
            this.showMessage(`${human.data.name} ate food!`);
            this.updateResourceDisplay();
        }
        else if (human.data.needs.tiredness > 70) {
            this.showMessage(`${human.data.name} needs sleep!`);
        }
        else {
            this.showMessage(`${human.data.name} is ready to work!`);
        }
    }
    handleFeedingStationInteraction(station) {
        if (station.data.needsCleaning) {
            station.clean();
            this.showMessage('Cleaned feeding station!');
        }
        else if (station.data.waterLevel < 20) {
            station.refillWater();
            this.showMessage('Refilled water!');
        }
        else if (station.data.formulaAmount < 5) {
            if (station.makeFormula()) {
                this.showMessage('Made formula!');
            }
            else {
                this.showMessage('Cannot make formula - check station status!');
            }
        }
        else {
            this.showMessage('Feeding station is ready!');
        }
    }
    showEntityStatus(entity) {
        this.statusText.setText(entity.getStatusText());
    }
    updateGame() {
        const deltaTime = 100; // 100ms
        // Update all entities
        this.grid.getAllItems().forEach(item => {
            const entity = this.getEntityFromItem(item);
            if (entity) {
                entity.update(deltaTime);
                // Update the grid item data
                item.data = entity.data;
            }
        });
        // Update UI
        if (this.selectedEntity) {
            this.showEntityStatus(this.selectedEntity);
        }
    }
    updateResourceDisplay() {
        const text = `Money: $${this.resources.money} | Diapers: ${this.resources.diapers} | Formula: ${this.resources.formula} | Sensitive: ${this.resources.sensitiveFormula} | Food: ${this.resources.food}`;
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
//# sourceMappingURL=MainGameScene.js.map