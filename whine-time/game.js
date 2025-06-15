"use strict";
// Simple working game without complex imports
class BabyGame extends Phaser.Scene {
    constructor() {
        super({ key: 'BabyGame' });
        this.gridSize = 64;
        this.gridWidth = 16;
        this.gridHeight = 12;
        this.placementMode = null;
        this.selectedHuman = null;
        this.resources = {
            money: 500,
            diapers: 20,
            formula: 10,
            food: 10,
            happiness: 0,
            experience: 0
        };
        this.gameStats = {
            level: 1,
            babiesCaredFor: 0,
            tasksCompleted: 0,
            totalMoney: 500,
            daysPassed: 0,
            reputation: 0,
            currentHour: 9
        };
        this.upgrades = {
            fasterFeeding: false,
            efficientFormula: false,
            autoComfort: false,
            doubleHappiness: false,
            stressReduction: false,
            bonusMoney: false
        };
        this.achievements = new Set();
        this.notifications = [];
        this.entities = new Map();
        this.humans = new Map();
    }
    create() {
        console.log('BabyGame create() called');
        // Create a nice gradient background
        this.createBackground();
        // Draw grid with better visibility
        this.drawGrid();
        this.createUI();
        this.placeInitialEntities();
        this.setupInput();
        // Start game loop
        this.time.addEvent({
            delay: 2000, // Update every 2 seconds
            callback: this.updateGame,
            callbackScope: this,
            loop: true
        });
        // Add hour cycle
        this.time.addEvent({
            delay: 1250, // New hour every 1.25 seconds (24 hours = 30 seconds for full day)
            callback: this.advanceHour,
            callbackScope: this,
            loop: true
        });
        // Add day/night cycle
        this.time.addEvent({
            delay: 30000, // New day every 30 seconds
            callback: this.advanceDay,
            callbackScope: this,
            loop: true
        });
        // Check achievements periodically
        this.time.addEvent({
            delay: 5000,
            callback: this.checkAchievements,
            callbackScope: this,
            loop: true
        });
        // Start smooth movement loop
        this.time.addEvent({
            delay: 50, // Update every 50ms for smooth movement
            callback: this.updateMovement,
            callbackScope: this,
            loop: true
        });
    }
    createBackground() {
        const gameWidth = this.gridWidth * this.gridSize;
        const gameHeight = this.gridHeight * this.gridSize;
        // Create a nursery-themed background
        const bgGraphics = this.add.graphics();
        // Soft pastel gradient background
        const gradient = this.add.graphics();
        gradient.fillGradientStyle(0xFFE4E1, 0xE6E6FA, 0xF0FFFF, 0xFFF8DC, 1);
        gradient.fillRect(0, 0, gameWidth, gameHeight);
        // Add playful polka dot pattern
        bgGraphics.fillStyle(0xFFB6C1, 0.3); // Light pink dots
        for (let x = 16; x < gameWidth; x += 96) {
            for (let y = 16; y < gameHeight; y += 96) {
                bgGraphics.fillCircle(x, y, 8);
            }
        }
        // Add baby blue dots offset
        bgGraphics.fillStyle(0xADD8E6, 0.3); // Light blue dots
        for (let x = 64; x < gameWidth; x += 96) {
            for (let y = 64; y < gameHeight; y += 96) {
                bgGraphics.fillCircle(x, y, 6);
            }
        }
        // Add soft yellow stars
        bgGraphics.fillStyle(0xFFFF99, 0.4);
        for (let x = 48; x < gameWidth; x += 128) {
            for (let y = 32; y < gameHeight; y += 128) {
                this.drawStar(bgGraphics, x, y, 5, 4, 8);
            }
        }
        // Add cute border with baby theme
        const borderGraphics = this.add.graphics();
        borderGraphics.lineStyle(6, 0xFF69B4, 0.8); // Hot pink border
        borderGraphics.strokeRect(3, 3, gameWidth - 6, gameHeight - 6);
        // Inner decorative border with baby colors
        borderGraphics.lineStyle(3, 0x87CEEB, 0.7); // Sky blue
        borderGraphics.strokeRect(9, 9, gameWidth - 18, gameHeight - 18);
        // Add corner decorations
        this.addCornerDecorations(gameWidth, gameHeight);
    }
    drawGrid() {
        const gameWidth = this.gridWidth * this.gridSize;
        const gameHeight = this.gridHeight * this.gridSize;
        // Create individual nursery floor tiles instead of just lines
        for (let x = 0; x < this.gridWidth; x++) {
            for (let y = 0; y < this.gridHeight; y++) {
                this.createNurseryTile(x, y);
            }
        }
        // Add playful grid lines with baby colors
        const gridGraphics = this.add.graphics();
        gridGraphics.lineStyle(2, 0xFFB6C1, 0.6); // Soft pink lines
        // Draw vertical lines
        for (let x = 0; x <= this.gridWidth; x++) {
            const xPos = x * this.gridSize;
            gridGraphics.moveTo(xPos, 0);
            gridGraphics.lineTo(xPos, gameHeight);
        }
        // Draw horizontal lines
        for (let y = 0; y <= this.gridHeight; y++) {
            const yPos = y * this.gridSize;
            gridGraphics.moveTo(0, yPos);
            gridGraphics.lineTo(gameWidth, yPos);
        }
        gridGraphics.strokePath();
        // Add cute coordinate markers
        const coordStyle = {
            fontSize: '12px',
            color: '#FF69B4',
            fontFamily: 'Comic Sans MS, cursive',
            backgroundColor: '#FFFFFF',
            padding: { x: 3, y: 2 },
            alpha: 0.8
        };
        // Add playful coordinate labels
        for (let x = 0; x <= this.gridWidth; x += 4) {
            if (x > 0) {
                this.add.text(x * this.gridSize + 4, 4, `${x}`, coordStyle);
            }
        }
        for (let y = 0; y <= this.gridHeight; y += 4) {
            if (y > 0) {
                this.add.text(4, y * this.gridSize + 4, `${y}`, coordStyle);
            }
        }
    }
    createUI() {
        const uiY = this.gridHeight * this.gridSize + 10;
        // Status text
        this.statusText = this.add.text(10, uiY, 'Click humans to select them, then click babies/stations to assign tasks!', {
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
        const recruitHumanBtn = this.add.text(buttonX, buttonY, 'Recruit Human ($200)', {
            fontSize: '12px',
            color: '#FFFFFF',
            backgroundColor: '#FF9800',
            padding: { x: 8, y: 4 }
        }).setInteractive();
        recruitHumanBtn.on('pointerdown', () => {
            this.recruitHuman();
        });
        buttonX += 150;
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
        buttonX += 80;
        const upgradeBtn = this.add.text(buttonX, buttonY, 'Upgrades', {
            fontSize: '12px',
            color: '#FFFFFF',
            backgroundColor: '#9C27B0',
            padding: { x: 8, y: 4 }
        }).setInteractive();
        upgradeBtn.on('pointerdown', () => {
            this.showUpgradeMenu();
        });
        buttonX += 80;
        const achieveBtn = this.add.text(buttonX, buttonY, 'Goals', {
            fontSize: '12px',
            color: '#FFFFFF',
            backgroundColor: '#FF5722',
            padding: { x: 8, y: 4 }
        }).setInteractive();
        achieveBtn.on('pointerdown', () => {
            this.showAchievements();
        });
        this.updateResourceDisplay();
    }
    placeInitialEntities() {
        this.createBaby(2, 2, 'Emma');
        this.createHuman(4.5, 4.5, 'Sarah'); // Humans can be positioned between grid cells
        this.createFeedingStation(6, 2);
    }
    createBaby(gridX, gridY, name) {
        const worldX = gridX * this.gridSize + this.gridSize / 2;
        const worldY = gridY * this.gridSize + this.gridSize / 2;
        // Add shadow first
        const shadow = this.add.ellipse(worldX + 2, worldY + 2, 50, 50, 0x000000, 0.2);
        // Create baby sprite with rounded corners
        const baby = this.add.ellipse(worldX, worldY, 48, 48, 0xFFB6C1);
        baby.setStrokeStyle(3, 0xFF69B4);
        baby.setInteractive();
        baby.setData('type', 'baby');
        baby.setData('name', name);
        baby.setData('hunger', 60);
        baby.setData('happiness', 70);
        baby.setData('sleepy', 40);
        baby.setData('crying', false);
        baby.setData('lastFed', 0);
        baby.setData('personalityType', Math.floor(Math.random() * 3)); // 0=easy, 1=normal, 2=difficult
        baby.setData('shadow', shadow);
        // Add cute face
        const leftEye = this.add.circle(worldX - 8, worldY - 6, 3, 0x000000);
        const rightEye = this.add.circle(worldX + 8, worldY - 6, 3, 0x000000);
        const mouth = this.add.arc(worldX, worldY + 4, 8, 0, Math.PI, false, 0x000000);
        mouth.setStrokeStyle(2, 0x000000);
        mouth.setFillStyle();
        baby.setData('leftEye', leftEye);
        baby.setData('rightEye', rightEye);
        baby.setData('mouth', mouth);
        // Click handling is done by grid-based system in setupInput
        this.entities.set(`baby_${gridX}_${gridY}`, baby);
        // Add name label with background
        const nameLabel = this.add.text(worldX, worldY - 35, name, {
            fontSize: '11px',
            color: '#FFFFFF',
            backgroundColor: '#FF69B4',
            padding: { x: 6, y: 2 }
        }).setOrigin(0.5);
        baby.setData('nameLabel', nameLabel);
    }
    createHuman(worldGridX, worldGridY, name) {
        const worldX = worldGridX * this.gridSize;
        const worldY = worldGridY * this.gridSize;
        // Add shadow
        const shadow = this.add.ellipse(worldX + 2, worldY + 2, 42, 62, 0x000000, 0.2);
        // Create human body (rounded rectangle)
        const human = this.add.rectangle(worldX, worldY, 40, 60, 0xFF69B4, 1);
        human.setStrokeStyle(3, 0xE91E63);
        human.setInteractive();
        human.setData('type', 'human');
        human.setData('name', name);
        human.setData('hunger', 50);
        human.setData('tiredness', 30);
        human.setData('stress', 20);
        human.setData('shadow', shadow);
        human.setData('worldX', worldX);
        human.setData('worldY', worldY);
        human.setData('targetX', worldX);
        human.setData('targetY', worldY);
        human.setData('isMoving', false);
        human.setData('moveSpeed', 100); // pixels per second
        human.setData('taskQueue', []);
        human.setData('currentTask', null);
        human.setData('taskStartTime', 0);
        human.setData('isIdle', true);
        // Add head
        const head = this.add.circle(worldX, worldY - 15, 12, 0xFFDBB5);
        head.setStrokeStyle(2, 0xD4A574);
        // Add simple face
        const leftEye = this.add.circle(worldX - 4, worldY - 18, 1.5, 0x000000);
        const rightEye = this.add.circle(worldX + 4, worldY - 18, 1.5, 0x000000);
        const mouth = this.add.circle(worldX, worldY - 12, 2, 0xFF6B6B);
        human.setData('head', head);
        human.setData('leftEye', leftEye);
        human.setData('rightEye', rightEye);
        human.setData('mouth', mouth);
        human.on('pointerdown', () => this.selectHuman(human));
        // Store in humans map instead of entities
        this.humans.set(name, human);
        // Add name label with background
        const nameLabel = this.add.text(worldX, worldY - 42, name, {
            fontSize: '11px',
            color: '#FFFFFF',
            backgroundColor: '#E91E63',
            padding: { x: 6, y: 2 }
        }).setOrigin(0.5);
        human.setData('nameLabel', nameLabel);
        // Add selection indicator (initially hidden)
        const selectionRing = this.add.circle(worldX, worldY, 35, 0x00FF00, 0);
        selectionRing.setStrokeStyle(3, 0x00FF00, 0.8);
        selectionRing.setVisible(false);
        human.setData('selectionRing', selectionRing);
    }
    createFeedingStation(gridX, gridY) {
        const worldX = gridX * this.gridSize + this.gridSize / 2;
        const worldY = gridY * this.gridSize + this.gridSize / 2;
        // Add shadow
        const shadow = this.add.rectangle(worldX + 3, worldY + 3, 58, 58, 0x000000, 0.2);
        // Create main station body
        const station = this.add.rectangle(worldX, worldY, 56, 56, 0x4682B4);
        station.setStrokeStyle(3, 0x2E5984);
        station.setInteractive();
        station.setData('type', 'feeding_station');
        station.setData('formula', 5);
        station.setData('water', 100);
        station.setData('shadow', shadow);
        // Add details to make it look like a machine
        const topPanel = this.add.rectangle(worldX, worldY - 15, 50, 15, 0x5A95D6);
        const screen = this.add.rectangle(worldX - 8, worldY - 15, 12, 8, 0x90EE90);
        const buttons = this.add.rectangle(worldX + 8, worldY - 15, 8, 8, 0xFF6B6B);
        // Add dispensing area
        const dispenser = this.add.rectangle(worldX, worldY + 15, 30, 12, 0x2E5984);
        station.setData('topPanel', topPanel);
        station.setData('screen', screen);
        station.setData('buttons', buttons);
        station.setData('dispenser', dispenser);
        // Click handling is done by grid-based system in setupInput
        this.entities.set(`station_${gridX}_${gridY}`, station);
        // Add label with icon
        this.add.text(worldX, worldY + 2, '🍼', {
            fontSize: '20px'
        }).setOrigin(0.5);
        // Add status indicator
        const statusLabel = this.add.text(worldX, worldY - 35, 'Feeding Station', {
            fontSize: '10px',
            color: '#FFFFFF',
            backgroundColor: '#4682B4',
            padding: { x: 4, y: 2 }
        }).setOrigin(0.5);
        station.setData('statusLabel', statusLabel);
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
            else if (this.selectedHuman) {
                // Assign task to selected human
                this.handleTaskAssignment(pointer.x, pointer.y);
            }
            else {
                // Check if clicking on a human to select them
                this.checkHumanSelection(pointer.x, pointer.y);
            }
        });
    }
    handlePlacement(gridX, gridY) {
        const key = `baby_${gridX}_${gridY}`;
        if (this.entities.has(key)) {
            this.showMessage('Space occupied!');
            return;
        }
        if (this.placementMode === 'baby') {
            const babyCount = Array.from(this.entities.keys()).filter(k => k.startsWith('baby_')).length;
            this.createBaby(gridX, gridY, `Baby ${babyCount + 1}`);
            this.showMessage(`Placed baby at grid ${gridX}, ${gridY}`);
            this.placementMode = null;
        }
    }
    selectHuman(human) {
        // Deselect previous human
        if (this.selectedHuman) {
            this.selectedHuman.getData('selectionRing').setVisible(false);
        }
        // Select new human
        this.selectedHuman = human;
        human.getData('selectionRing').setVisible(true);
        const name = human.getData('name');
        const queueLength = human.getData('taskQueue').length;
        this.showMessage(`Selected ${name}. Tasks in queue: ${queueLength}/3. Click babies/stations to assign tasks.`);
        // Update status to show human info
        this.displayHumanStatus(human);
    }
    checkHumanSelection(worldX, worldY) {
        // Check if clicking on a human
        for (const human of this.humans.values()) {
            const humanX = human.getData('worldX');
            const humanY = human.getData('worldY');
            const distance = Math.sqrt((worldX - humanX) ** 2 + (worldY - humanY) ** 2);
            if (distance <= 40) { // Within clicking range of human
                this.selectHuman(human);
                return;
            }
        }
        // If no human was clicked, deselect current selection
        if (this.selectedHuman) {
            this.selectedHuman.getData('selectionRing').setVisible(false);
            this.selectedHuman = null;
            this.showMessage('Human deselected.');
        }
    }
    handleTaskAssignment(worldX, worldY) {
        if (!this.selectedHuman)
            return;
        const taskQueue = this.selectedHuman.getData('taskQueue');
        if (taskQueue.length >= 3) {
            this.showMessage('Task queue is full! (max 3 tasks)');
            return;
        }
        // Check what was clicked
        const gridX = Math.floor(worldX / this.gridSize);
        const gridY = Math.floor(worldY / this.gridSize);
        const babyKey = `baby_${gridX}_${gridY}`;
        const stationKey = `station_${gridX}_${gridY}`;
        if (this.entities.has(babyKey)) {
            this.assignBabyTask(this.selectedHuman, babyKey);
        }
        else if (this.entities.has(stationKey)) {
            this.assignStationTask(this.selectedHuman, stationKey);
        }
        else {
            this.showMessage('Click on a baby or feeding station to assign a task.');
        }
    }
    assignBabyTask(human, babyKey) {
        const baby = this.entities.get(babyKey);
        const babyName = baby.getData('name');
        const hunger = baby.getData('hunger');
        const sleepy = baby.getData('sleepy');
        let taskType = 'comfort';
        if (hunger > 70) {
            taskType = 'feed';
        }
        else if (sleepy > 80) {
            taskType = 'sleep';
        }
        const task = {
            type: taskType,
            targetId: babyKey,
            targetName: babyName,
            targetX: baby.x,
            targetY: baby.y
        };
        const taskQueue = human.getData('taskQueue');
        taskQueue.push(task);
        human.setData('taskQueue', taskQueue);
        const humanName = human.getData('name');
        this.showMessage(`${humanName} assigned to ${taskType} ${babyName}. Queue: ${taskQueue.length}/3`);
    }
    assignStationTask(human, stationKey) {
        const station = this.entities.get(stationKey);
        const formula = station.getData('formula');
        const water = station.getData('water');
        let taskType = 'operate_station';
        if (formula < 3) {
            taskType = 'make_formula';
        }
        else if (water < 50) {
            taskType = 'refill_water';
        }
        const task = {
            type: taskType,
            targetId: stationKey,
            targetName: 'Feeding Station',
            targetX: station.x,
            targetY: station.y
        };
        const taskQueue = human.getData('taskQueue');
        taskQueue.push(task);
        human.setData('taskQueue', taskQueue);
        const humanName = human.getData('name');
        this.showMessage(`${humanName} assigned to ${taskType.replace('_', ' ')}. Queue: ${taskQueue.length}/3`);
    }
    recruitHuman() {
        if (this.resources.money < 200) {
            this.showMessage('Not enough money to recruit! Need $200.');
            return;
        }
        const humanCount = this.humans.size;
        const name = `Worker ${humanCount + 1}`;
        // Place new human at a random location
        const x = 2 + Math.random() * 3;
        const y = 2 + Math.random() * 3;
        this.createHuman(x, y, name);
        this.resources.money -= 200;
        this.updateResourceDisplay();
        this.showMessage(`Recruited ${name}!`);
    }
    displayHumanStatus(human) {
        const name = human.getData('name');
        const hunger = human.getData('hunger');
        const tiredness = human.getData('tiredness');
        const stress = human.getData('stress');
        const currentTask = human.getData('currentTask');
        const taskQueue = human.getData('taskQueue');
        let statusText = `${name} - Hunger: ${hunger}, Tired: ${tiredness}, Stress: ${stress}\n`;
        if (currentTask) {
            statusText += `Current: ${currentTask.type} ${currentTask.targetName}`;
        }
        else if (taskQueue.length > 0) {
            statusText += `Next: ${taskQueue[0].type} ${taskQueue[0].targetName}`;
        }
        else {
            statusText += 'Idle - no tasks assigned';
        }
        statusText += `\nQueue: ${taskQueue.length}/3 tasks`;
        this.statusText.setText(statusText);
    }
    updateGame() {
        // Update all babies and stations
        this.entities.forEach((entity) => {
            const type = entity.getData('type');
            if (type === 'baby') {
                const hunger = entity.getData('hunger');
                const happiness = entity.getData('happiness');
                const sleepy = entity.getData('sleepy');
                // Babies get hungry and sleepy over time based on personality
                const personalityType = entity.getData('personalityType');
                const hungerRate = personalityType === 2 ? 12 : (personalityType === 1 ? 8 : 6);
                const sleepyRate = personalityType === 2 ? 15 : (personalityType === 1 ? 10 : 8);
                entity.setData('hunger', Math.min(100, hunger + hungerRate));
                entity.setData('sleepy', Math.min(100, sleepy + sleepyRate));
                // Crying logic
                const isCrying = entity.getData('crying');
                if ((hunger > 75 || sleepy > 85) && !isCrying) {
                    entity.setData('crying', true);
                    this.makeBabyCry(entity);
                }
                else if (hunger < 50 && sleepy < 60 && isCrying) {
                    entity.setData('crying', false);
                    this.stopBabyCrying(entity);
                }
                // Update baby color based on state and crying
                const babyIsCrying = entity.getData('crying');
                if (babyIsCrying) {
                    entity.setFillStyle(0xFF4444); // Bright red when crying
                    this.animateCryingBaby(entity);
                }
                else if (hunger > 80) {
                    entity.setFillStyle(0xFF6B6B); // Red when very hungry
                }
                else if (sleepy > 80) {
                    entity.setFillStyle(0x9370DB); // Purple when sleepy
                }
                else if (hunger < 30 && happiness > 70) {
                    entity.setFillStyle(0x98FB98); // Light green when happy
                }
                else {
                    entity.setFillStyle(0xFFB6C1); // Pink normal state
                }
            }
        });
        // Update all humans
        this.humans.forEach((human) => {
            this.updateHuman(human);
        });
    }
    updateHuman(human) {
        const hunger = human.getData('hunger');
        const tiredness = human.getData('tiredness');
        const stress = human.getData('stress');
        // Update needs over time (affected by upgrades)
        const stressMultiplier = this.upgrades.stressReduction ? 0.5 : 1;
        human.setData('hunger', Math.min(100, hunger + 5));
        human.setData('tiredness', Math.min(100, tiredness + 3));
        // Stress from crying babies
        let cryingBabies = 0;
        this.entities.forEach(entity => {
            if (entity.getData('type') === 'baby' && entity.getData('crying')) {
                cryingBabies++;
            }
        });
        if (cryingBabies > 0) {
            human.setData('stress', Math.min(100, stress + (cryingBabies * 3 * stressMultiplier)));
        }
        // Base stress changes
        if (hunger > 70 || tiredness > 70) {
            human.setData('stress', Math.min(100, stress + (5 * stressMultiplier)));
        }
        else {
            human.setData('stress', Math.max(0, stress - 1));
        }
        // High stress affects task performance
        if (stress > 80) {
            const taskQueue = human.getData('taskQueue');
            if (taskQueue.length > 0 && Math.random() < 0.1) {
                // 10% chance to drop a task when very stressed
                taskQueue.pop();
                human.setData('taskQueue', taskQueue);
                this.showMessage(`${human.getData('name')} is too stressed and dropped a task!`);
            }
        }
        // Update human color based on state
        if (hunger > 80 || tiredness > 80 || stress > 80) {
            human.setFillStyle(0xFF6B6B); // Red when struggling
        }
        else if (stress > 50) {
            human.setFillStyle(0xFFA500); // Orange when stressed
        }
        else {
            human.setFillStyle(0xFF69B4); // Pink normal state
        }
        // Handle task processing
        this.processHumanTasks(human);
        // Movement is now handled in updateMovement method
        // Update visual components
        this.updateHumanVisuals(human);
    }
    processHumanTasks(human) {
        const currentTask = human.getData('currentTask');
        const taskQueue = human.getData('taskQueue');
        if (!currentTask && taskQueue.length > 0) {
            // Start next task
            const nextTask = taskQueue.shift();
            human.setData('currentTask', nextTask);
            human.setData('taskQueue', taskQueue);
            human.setData('isIdle', false);
            // Move to task location
            this.moveHumanToTask(human, nextTask);
        }
        else if (currentTask) {
            // Check if human has reached the task location
            const humanX = human.getData('worldX');
            const humanY = human.getData('worldY');
            const distance = Math.sqrt((humanX - currentTask.targetX) ** 2 + (humanY - currentTask.targetY) ** 2);
            if (distance <= 60 && !human.getData('isMoving')) {
                // Execute the task
                this.executeTask(human, currentTask);
                human.setData('currentTask', null);
                if (taskQueue.length === 0) {
                    human.setData('isIdle', true);
                }
            }
            else if (!human.getData('isMoving') && distance > 60) {
                // If somehow stopped but not at target, restart movement
                this.moveHumanToTask(human, currentTask);
            }
        }
    }
    moveHumanToTask(human, task) {
        const gameWidth = this.gridWidth * this.gridSize;
        const gameHeight = this.gridHeight * this.gridSize;
        const humanX = human.getData('worldX');
        const humanY = human.getData('worldY');
        // Calculate stopping position near target (not on top of it)
        const targetX = task.targetX;
        const targetY = task.targetY;
        const stopDistance = 50; // Stop 50 pixels away from target
        // Calculate direction from target to human's current position
        const dx = humanX - targetX;
        const dy = humanY - targetY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        let finalTargetX, finalTargetY;
        if (distance > stopDistance) {
            // Move closer to target but stop at proper distance
            const ratio = stopDistance / distance;
            finalTargetX = targetX + dx * ratio;
            finalTargetY = targetY + dy * ratio;
        }
        else {
            // Already close enough, stay in current position
            finalTargetX = humanX;
            finalTargetY = humanY;
        }
        // Constrain to game area
        finalTargetX = Math.max(30, Math.min(gameWidth - 30, finalTargetX));
        finalTargetY = Math.max(30, Math.min(gameHeight - 30, finalTargetY));
        human.setData('targetX', finalTargetX);
        human.setData('targetY', finalTargetY);
        human.setData('isMoving', true);
    }
    executeTask(human, task) {
        const humanName = human.getData('name');
        switch (task.type) {
            case 'feed':
                this.executeTaskFeedBaby(human, task);
                break;
            case 'sleep':
                this.executeTaskHelpSleep(human, task);
                break;
            case 'comfort':
                this.executeTaskComfort(human, task);
                break;
            case 'make_formula':
                this.executeTaskMakeFormula(human, task);
                break;
            case 'refill_water':
                this.executeTaskRefillWater(human, task);
                break;
            default:
                this.showMessage(`${humanName} completed unknown task.`);
        }
    }
    executeTaskFeedBaby(human, task) {
        if (this.resources.formula > 0) {
            const baby = this.entities.get(task.targetId);
            if (baby) {
                const hunger = baby.getData('hunger');
                const feedAmount = this.upgrades.fasterFeeding ? 70 : 50;
                const happinessBonus = this.upgrades.doubleHappiness ? 40 : 20;
                baby.setData('hunger', Math.max(0, hunger - feedAmount));
                baby.setData('happiness', Math.min(100, baby.getData('happiness') + happinessBonus));
                baby.setData('sleepy', Math.min(100, baby.getData('sleepy') + 30));
                const formulaUsed = this.upgrades.efficientFormula ? 0.5 : 1;
                this.resources.formula -= formulaUsed;
                this.resources.happiness += 5;
                this.resources.experience += 10;
                this.gameStats.tasksCompleted++;
                this.gameStats.babiesCaredFor++;
                this.addHappinessEffect(baby.x, baby.y);
                const humanName = human.getData('name');
                this.showMessage(`${humanName} fed ${task.targetName}! (+5 happiness, +10 XP)`);
                this.updateResourceDisplay();
                this.checkLevelUp();
                baby.setFillStyle(0x98FB98);
            }
        }
        else {
            this.showMessage('No formula available!');
        }
    }
    executeTaskHelpSleep(human, task) {
        const baby = this.entities.get(task.targetId);
        if (baby) {
            const sleepy = baby.getData('sleepy');
            const happinessBonus = this.upgrades.doubleHappiness ? 60 : 30;
            baby.setData('sleepy', Math.max(0, sleepy - 60));
            baby.setData('happiness', Math.min(100, baby.getData('happiness') + happinessBonus));
            baby.setData('hunger', Math.min(100, baby.getData('hunger') + 20));
            this.resources.happiness += 8;
            this.resources.experience += 15;
            this.gameStats.tasksCompleted++;
            this.addSleepEffect(baby.x, baby.y);
            const humanName = human.getData('name');
            this.showMessage(`${humanName} helped ${task.targetName} sleep! (+8 happiness, +15 XP)`);
            this.updateResourceDisplay();
            this.checkLevelUp();
            baby.setFillStyle(0x9370DB);
        }
    }
    executeTaskComfort(human, task) {
        const baby = this.entities.get(task.targetId);
        if (baby) {
            const happiness = baby.getData('happiness');
            const comfortAmount = this.upgrades.autoComfort ? 25 : 15;
            const happinessBonus = this.upgrades.doubleHappiness ? 6 : 3;
            baby.setData('happiness', Math.min(100, happiness + comfortAmount));
            this.resources.happiness += happinessBonus;
            this.resources.experience += 5;
            this.gameStats.tasksCompleted++;
            this.addComfortEffect(baby.x, baby.y);
            const humanName = human.getData('name');
            this.showMessage(`${humanName} comforted ${task.targetName}! (+${happinessBonus} happiness, +5 XP)`);
            this.updateResourceDisplay();
            this.checkLevelUp();
            baby.setFillStyle(0x98FB98);
        }
    }
    executeTaskMakeFormula(human, task) {
        const station = this.entities.get(task.targetId);
        if (station) {
            const formula = station.getData('formula');
            const water = station.getData('water');
            if (water >= 20) {
                station.setData('formula', formula + 3);
                station.setData('water', Math.max(0, water - 20));
                const humanName = human.getData('name');
                this.showMessage(`${humanName} made formula at the station!`);
            }
            else {
                this.showMessage('Not enough water to make formula!');
            }
        }
    }
    executeTaskRefillWater(human, task) {
        const station = this.entities.get(task.targetId);
        if (station) {
            station.setData('water', 100);
            const humanName = human.getData('name');
            this.showMessage(`${humanName} refilled water at the station!`);
        }
    }
    updateMovement() {
        // Update movement for all humans smoothly
        this.humans.forEach((human) => {
            if (human.getData('isMoving')) {
                this.moveHumanStep(human);
            }
        });
    }
    moveHumanStep(human) {
        const currentX = human.getData('worldX');
        const currentY = human.getData('worldY');
        const targetX = human.getData('targetX');
        const targetY = human.getData('targetY');
        const moveSpeed = human.getData('moveSpeed');
        const deltaTime = 50; // 50ms updates for smooth movement
        const moveDistance = (moveSpeed * deltaTime) / 1000;
        const dx = targetX - currentX;
        const dy = targetY - currentY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance <= moveDistance || distance < 3) {
            // Reached target or very close - snap to exact position
            human.setData('worldX', targetX);
            human.setData('worldY', targetY);
            human.setData('isMoving', false);
        }
        else {
            // Move towards target smoothly
            const moveRatio = moveDistance / distance;
            const newX = currentX + dx * moveRatio;
            const newY = currentY + dy * moveRatio;
            human.setData('worldX', newX);
            human.setData('worldY', newY);
        }
        // Update visuals immediately for smooth movement
        this.updateHumanVisuals(human);
    }
    updateHumanVisuals(human) {
        const x = human.getData('worldX');
        const y = human.getData('worldY');
        // Update all visual components
        human.setPosition(x, y);
        human.getData('shadow').setPosition(x + 2, y + 2);
        human.getData('head').setPosition(x, y - 15);
        human.getData('leftEye').setPosition(x - 4, y - 18);
        human.getData('rightEye').setPosition(x + 4, y - 18);
        human.getData('mouth').setPosition(x, y - 12);
        human.getData('nameLabel').setPosition(x, y - 42);
        human.getData('selectionRing').setPosition(x, y);
    }
    updateResourceDisplay() {
        const hourDisplay = this.formatHour(this.gameStats.currentHour);
        const text = `Money: $${this.resources.money} | Formula: ${this.resources.formula} | Happiness: ${this.resources.happiness} | Level: ${this.gameStats.level} | Day: ${this.gameStats.daysPassed} | Hour: ${hourDisplay} | XP: ${this.resources.experience}`;
        this.resourceText.setText(text);
    }
    showMessage(text) {
        // Remove existing message
        this.children.getChildren().forEach((child) => {
            if (child.getData && child.getData('isMessage')) {
                child.destroy();
            }
        });
        const message = this.add.text(512, 50, text, {
            fontSize: '18px',
            color: '#000000',
            backgroundColor: '#FFFF99',
            padding: { x: 15, y: 8 }
        }).setOrigin(0.5).setData('isMessage', true);
        this.time.delayedCall(4000, () => {
            if (message && message.active) {
                message.destroy();
            }
        });
    }
    advanceHour() {
        this.gameStats.currentHour = (this.gameStats.currentHour + 1) % 24;
        this.updateResourceDisplay();
    }
    formatHour(hour) {
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        return `${displayHour}:00 ${period}`;
    }
    advanceDay() {
        this.gameStats.daysPassed++;
        this.gameStats.currentHour = 9; // Reset to 9 AM at start of new day
        // Daily bonuses and events
        const moneyBonus = this.upgrades.bonusMoney ? 100 : 50;
        this.resources.money += moneyBonus;
        this.gameStats.totalMoney += moneyBonus;
        // Random events
        if (Math.random() < 0.3) {
            this.triggerRandomEvent();
        }
        this.showNotification(`Day ${this.gameStats.daysPassed} - Earned $${moneyBonus} daily income!`, 0x4CAF50);
        this.updateResourceDisplay();
    }
    triggerRandomEvent() {
        const events = [
            { message: 'Surprise donation! +$200', money: 200, happiness: 0 },
            { message: 'Community appreciation! +20 happiness', money: 0, happiness: 20 },
            { message: 'Formula delivery! +5 formula', money: 0, happiness: 0, formula: 5 },
            { message: 'Volunteer helper reduces stress!', money: 0, happiness: 15 }
        ];
        const event = events[Math.floor(Math.random() * events.length)];
        this.resources.money += event.money || 0;
        this.resources.happiness += event.happiness || 0;
        if (event.formula)
            this.resources.formula += event.formula;
        this.showNotification(event.message, 0xFF9800);
    }
    checkLevelUp() {
        const expNeeded = this.gameStats.level * 100;
        if (this.resources.experience >= expNeeded) {
            this.gameStats.level++;
            this.resources.experience -= expNeeded;
            this.resources.money += this.gameStats.level * 50;
            this.showNotification(`LEVEL UP! You are now level ${this.gameStats.level}! +$${this.gameStats.level * 50}`, 0x9C27B0);
            this.playLevelUpEffect();
        }
    }
    checkAchievements() {
        const achievementsList = [
            { id: 'first_baby', name: 'First Steps', desc: 'Care for your first baby', condition: () => this.gameStats.babiesCaredFor >= 1, reward: 50 },
            { id: 'caring_master', name: 'Caring Master', desc: 'Complete 100 tasks', condition: () => this.gameStats.tasksCompleted >= 100, reward: 200 },
            { id: 'wealthy', name: 'Wealthy Caregiver', desc: 'Earn $2000 total', condition: () => this.gameStats.totalMoney >= 2000, reward: 300 },
            { id: 'happiness_guru', name: 'Happiness Guru', desc: 'Accumulate 500 happiness', condition: () => this.resources.happiness >= 500, reward: 150 },
            { id: 'experienced', name: 'Experienced', desc: 'Reach level 10', condition: () => this.gameStats.level >= 10, reward: 500 },
            { id: 'survivor', name: 'Survivor', desc: 'Survive 30 days', condition: () => this.gameStats.daysPassed >= 30, reward: 400 }
        ];
        achievementsList.forEach(achievement => {
            if (!this.achievements.has(achievement.id) && achievement.condition()) {
                this.achievements.add(achievement.id);
                this.resources.money += achievement.reward;
                this.showNotification(`ACHIEVEMENT: ${achievement.name}! +$${achievement.reward}`, 0xFFD700);
                this.playAchievementEffect();
            }
        });
    }
    showUpgradeMenu() {
        // Remove existing menu
        this.children.getChildren().forEach((child) => {
            if (child.getData && child.getData('isUpgradeMenu')) {
                child.destroy();
            }
        });
        const menuBg = this.add.rectangle(512, 350, 600, 500, 0x000000, 0.8)
            .setData('isUpgradeMenu', true);
        const title = this.add.text(512, 150, 'UPGRADES', {
            fontSize: '24px',
            color: '#FFFFFF'
        }).setOrigin(0.5).setData('isUpgradeMenu', true);
        const upgrades = [
            { key: 'fasterFeeding', name: 'Faster Feeding', desc: 'Feeding reduces hunger by 70 instead of 50', cost: 300 },
            { key: 'efficientFormula', name: 'Efficient Formula', desc: 'Use 50% less formula per feeding', cost: 400 },
            { key: 'autoComfort', name: 'Super Comfort', desc: 'Comforting gives +25 happiness instead of +15', cost: 250 },
            { key: 'doubleHappiness', name: 'Double Happiness', desc: 'All actions give double happiness rewards', cost: 500 },
            { key: 'stressReduction', name: 'Stress Relief', desc: 'Humans get stressed 50% slower', cost: 350 },
            { key: 'bonusMoney', name: 'Daily Bonus', desc: 'Double daily income ($100 instead of $50)', cost: 600 }
        ];
        let yPos = 200;
        upgrades.forEach((upgrade, index) => {
            const owned = this.upgrades[upgrade.key];
            const canAfford = this.resources.money >= upgrade.cost;
            const color = owned ? '#00FF00' : (canAfford ? '#FFFFFF' : '#888888');
            const upgradeText = this.add.text(512, yPos, `${upgrade.name} - $${upgrade.cost} ${owned ? '(OWNED)' : ''}`, {
                fontSize: '16px',
                color: color
            }).setOrigin(0.5).setData('isUpgradeMenu', true);
            const descText = this.add.text(512, yPos + 20, upgrade.desc, {
                fontSize: '12px',
                color: '#CCCCCC'
            }).setOrigin(0.5).setData('isUpgradeMenu', true);
            if (!owned && canAfford) {
                upgradeText.setInteractive().on('pointerdown', () => {
                    this.buyUpgrade(upgrade.key);
                    this.showUpgradeMenu(); // Refresh menu
                });
            }
            yPos += 60;
        });
        const closeBtn = this.add.text(512, 550, 'CLOSE', {
            fontSize: '18px',
            color: '#FF4444',
            backgroundColor: '#FFFFFF',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive().setData('isUpgradeMenu', true);
        closeBtn.on('pointerdown', () => {
            this.children.getChildren().forEach((child) => {
                if (child.getData && child.getData('isUpgradeMenu')) {
                    child.destroy();
                }
            });
        });
    }
    buyUpgrade(upgradeKey) {
        const upgrades = {
            fasterFeeding: 300,
            efficientFormula: 400,
            autoComfort: 250,
            doubleHappiness: 500,
            stressReduction: 350,
            bonusMoney: 600
        };
        const cost = upgrades[upgradeKey];
        if (this.resources.money >= cost) {
            this.resources.money -= cost;
            this.upgrades[upgradeKey] = true;
            this.showNotification(`Purchased ${upgradeKey.replace(/([A-Z])/g, ' $1')}!`, 0x4CAF50);
            this.updateResourceDisplay();
        }
    }
    showAchievements() {
        // Remove existing menu
        this.children.getChildren().forEach((child) => {
            if (child.getData && child.getData('isAchievementMenu')) {
                child.destroy();
            }
        });
        const menuBg = this.add.rectangle(512, 350, 600, 500, 0x000000, 0.8)
            .setData('isAchievementMenu', true);
        const title = this.add.text(512, 150, 'ACHIEVEMENTS & GOALS', {
            fontSize: '24px',
            color: '#FFFFFF'
        }).setOrigin(0.5).setData('isAchievementMenu', true);
        const statsText = [
            `Level: ${this.gameStats.level}`,
            `Babies Cared For: ${this.gameStats.babiesCaredFor}`,
            `Tasks Completed: ${this.gameStats.tasksCompleted}`,
            `Days Survived: ${this.gameStats.daysPassed}`,
            `Total Money Earned: $${this.gameStats.totalMoney}`,
            `Current Happiness: ${this.resources.happiness}`,
            `Achievements Unlocked: ${this.achievements.size}/6`
        ];
        let yPos = 200;
        statsText.forEach(stat => {
            this.add.text(512, yPos, stat, {
                fontSize: '14px',
                color: '#FFFFFF'
            }).setOrigin(0.5).setData('isAchievementMenu', true);
            yPos += 25;
        });
        const goalText = this.add.text(512, yPos + 20, 'Next Goals:', {
            fontSize: '16px',
            color: '#FFD700'
        }).setOrigin(0.5).setData('isAchievementMenu', true);
        const goals = [
            `Reach Level ${this.gameStats.level + 1} (${this.resources.experience}/${(this.gameStats.level) * 100} XP)`,
            `Care for ${Math.max(10, this.gameStats.babiesCaredFor + 5)} babies`,
            `Survive ${Math.max(7, this.gameStats.daysPassed + 3)} days`
        ];
        goals.forEach((goal, index) => {
            this.add.text(512, yPos + 50 + (index * 20), goal, {
                fontSize: '12px',
                color: '#CCCCCC'
            }).setOrigin(0.5).setData('isAchievementMenu', true);
        });
        const closeBtn = this.add.text(512, 550, 'CLOSE', {
            fontSize: '18px',
            color: '#FF4444',
            backgroundColor: '#FFFFFF',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive().setData('isAchievementMenu', true);
        closeBtn.on('pointerdown', () => {
            this.children.getChildren().forEach((child) => {
                if (child.getData && child.getData('isAchievementMenu')) {
                    child.destroy();
                }
            });
        });
    }
    addHappinessEffect(x, y) {
        const heart = this.add.text(x, y, '❤️', {
            fontSize: '20px'
        }).setData('isEffect', true);
        this.tweens.add({
            targets: heart,
            y: y - 40,
            alpha: 0,
            duration: 1000,
            onComplete: () => heart.destroy()
        });
    }
    addSleepEffect(x, y) {
        const zzz = this.add.text(x, y, '💤', {
            fontSize: '20px'
        }).setData('isEffect', true);
        this.tweens.add({
            targets: zzz,
            y: y - 40,
            alpha: 0,
            duration: 1000,
            onComplete: () => zzz.destroy()
        });
    }
    addComfortEffect(x, y) {
        const star = this.add.text(x, y, '⭐', {
            fontSize: '20px'
        }).setData('isEffect', true);
        this.tweens.add({
            targets: star,
            y: y - 40,
            alpha: 0,
            duration: 1000,
            onComplete: () => star.destroy()
        });
    }
    playLevelUpEffect() {
        // Screen flash effect
        const flash = this.add.rectangle(512, 350, 1024, 700, 0xFFD700, 0.3);
        this.tweens.add({
            targets: flash,
            alpha: 0,
            duration: 500,
            onComplete: () => flash.destroy()
        });
    }
    playAchievementEffect() {
        // Sparkle effect
        for (let i = 0; i < 10; i++) {
            const sparkle = this.add.circle(Math.random() * 1024, Math.random() * 700, Math.random() * 5 + 2, 0xFFD700).setData('isEffect', true);
            this.tweens.add({
                targets: sparkle,
                alpha: 0,
                scaleX: 2,
                scaleY: 2,
                duration: 1000,
                delay: Math.random() * 500,
                onComplete: () => sparkle.destroy()
            });
        }
    }
    makeBabyCry(baby) {
        // Add crying visual effect
        const cryText = this.add.text(baby.x + 25, baby.y - 15, 'WAH!', {
            fontSize: '12px',
            color: '#FF0000',
            fontStyle: 'bold'
        }).setData('isCryEffect', true);
        baby.setData('cryText', cryText);
        // Make cry text bounce
        this.tweens.add({
            targets: cryText,
            y: baby.y - 25,
            duration: 500,
            yoyo: true,
            repeat: -1
        });
    }
    stopBabyCrying(baby) {
        const cryText = baby.getData('cryText');
        if (cryText && cryText.active) {
            this.tweens.killTweensOf(cryText);
            cryText.destroy();
        }
    }
    createNurseryTile(gridX, gridY) {
        const worldX = gridX * this.gridSize;
        const worldY = gridY * this.gridSize;
        const tileSize = this.gridSize;
        const tileGraphics = this.add.graphics();
        // Create different tile patterns based on position
        const pattern = (gridX + gridY) % 4;
        switch (pattern) {
            case 0:
                // Soft cream tile with tiny hearts
                tileGraphics.fillStyle(0xFFF8DC, 0.8);
                tileGraphics.fillRect(worldX + 2, worldY + 2, tileSize - 4, tileSize - 4);
                if (Math.random() < 0.3) {
                    this.add.text(worldX + tileSize / 2, worldY + tileSize / 2, '💕', {
                        fontSize: '12px',
                        alpha: 0.4
                    }).setOrigin(0.5);
                }
                break;
            case 1:
                // Light pink tile with stars
                tileGraphics.fillStyle(0xFFE4E1, 0.8);
                tileGraphics.fillRect(worldX + 2, worldY + 2, tileSize - 4, tileSize - 4);
                if (Math.random() < 0.2) {
                    this.add.text(worldX + tileSize / 2, worldY + tileSize / 2, '⭐', {
                        fontSize: '10px',
                        alpha: 0.5
                    }).setOrigin(0.5);
                }
                break;
            case 2:
                // Light blue tile with clouds
                tileGraphics.fillStyle(0xE6F3FF, 0.8);
                tileGraphics.fillRect(worldX + 2, worldY + 2, tileSize - 4, tileSize - 4);
                if (Math.random() < 0.25) {
                    this.add.text(worldX + tileSize / 2, worldY + tileSize / 2, '☁️', {
                        fontSize: '10px',
                        alpha: 0.4
                    }).setOrigin(0.5);
                }
                break;
            case 3:
                // Light yellow tile with moons
                tileGraphics.fillStyle(0xFFFFF0, 0.8);
                tileGraphics.fillRect(worldX + 2, worldY + 2, tileSize - 4, tileSize - 4);
                if (Math.random() < 0.2) {
                    this.add.text(worldX + tileSize / 2, worldY + tileSize / 2, '🌙', {
                        fontSize: '8px',
                        alpha: 0.5
                    }).setOrigin(0.5);
                }
                break;
        }
        // Add subtle tile border
        tileGraphics.lineStyle(1, 0xD3D3D3, 0.3);
        tileGraphics.strokeRect(worldX + 1, worldY + 1, tileSize - 2, tileSize - 2);
    }
    drawStar(graphics, x, y, points, innerRadius, outerRadius) {
        const angle = Math.PI / points;
        graphics.beginPath();
        graphics.moveTo(x + Math.cos(0) * outerRadius, y + Math.sin(0) * outerRadius);
        for (let i = 1; i < points * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const currentAngle = i * angle;
            graphics.lineTo(x + Math.cos(currentAngle) * radius, y + Math.sin(currentAngle) * radius);
        }
        graphics.closePath();
        graphics.fillPath();
    }
    addCornerDecorations(gameWidth, gameHeight) {
        // Top-left corner - baby bottle
        this.add.text(20, 20, '🍼', {
            fontSize: '24px',
            alpha: 0.6
        });
        // Top-right corner - teddy bear
        this.add.text(gameWidth - 40, 20, '🧸', {
            fontSize: '24px',
            alpha: 0.6
        });
        // Bottom-left corner - rattle
        this.add.text(20, gameHeight - 40, '🪀', {
            fontSize: '24px',
            alpha: 0.6
        });
        // Bottom-right corner - pacifier
        this.add.text(gameWidth - 40, gameHeight - 40, '🍼', {
            fontSize: '24px',
            alpha: 0.6
        });
        // Add playful border decorations
        for (let x = 80; x < gameWidth - 80; x += 120) {
            this.add.text(x, 15, '🌈', {
                fontSize: '16px',
                alpha: 0.5
            });
            this.add.text(x, gameHeight - 25, '🦋', {
                fontSize: '14px',
                alpha: 0.5
            });
        }
        for (let y = 80; y < gameHeight - 80; y += 120) {
            this.add.text(15, y, '🎈', {
                fontSize: '16px',
                alpha: 0.5
            });
            this.add.text(gameWidth - 25, y, '🌸', {
                fontSize: '14px',
                alpha: 0.5
            });
        }
    }
    animateCryingBaby(baby) {
        // Make baby shake when crying
        if (!baby.getData('isShaking')) {
            baby.setData('isShaking', true);
            this.tweens.add({
                targets: baby,
                x: baby.x + 2,
                duration: 100,
                yoyo: true,
                repeat: 3,
                onComplete: () => {
                    baby.setData('isShaking', false);
                }
            });
        }
    }
    showNotification(text, color) {
        const notification = this.add.text(512, 100 + this.notifications.length * 30, text, {
            fontSize: '14px',
            color: '#FFFFFF',
            backgroundColor: `#${color.toString(16).padStart(6, '0')}`,
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5).setData('isNotification', true);
        this.notifications.push(notification);
        this.time.delayedCall(3000, () => {
            const index = this.notifications.indexOf(notification);
            if (index > -1) {
                this.notifications.splice(index, 1);
                if (notification && notification.active) {
                    notification.destroy();
                }
            }
        });
    }
}
// Initialize the game
console.log('Starting Whine Time - Baby Care Factory Game...');
const config = {
    type: Phaser.AUTO,
    width: 1024,
    height: 900,
    parent: 'game-container',
    backgroundColor: '#87CEEB',
    scene: BabyGame,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0, x: 0 },
            debug: false
        }
    },
    scale: {
        mode: Phaser.Scale.NONE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};
const game = new Phaser.Game(config);
console.log('Game created successfully!');
//# sourceMappingURL=game.js.map