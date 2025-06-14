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
            food: 10
        };
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
        // Create a gradient texture for the floor
        const bgGraphics = this.add.graphics();
        // Base floor color - warm beige/cream
        bgGraphics.fillStyle(0xF5E6D3);
        bgGraphics.fillRect(0, 0, gameWidth, gameHeight);
        // Add some texture with subtle patterns
        bgGraphics.fillStyle(0xE8D5B7, 0.3);
        for (let x = 0; x < gameWidth; x += 32) {
            for (let y = 0; y < gameHeight; y += 32) {
                if ((Math.floor(x / 32) + Math.floor(y / 32)) % 2 === 0) {
                    bgGraphics.fillRect(x, y, 32, 32);
                }
            }
        }
        // Add border frame
        const borderGraphics = this.add.graphics();
        borderGraphics.lineStyle(4, 0x8B4513, 0.8); // Brown border
        borderGraphics.strokeRect(2, 2, gameWidth - 4, gameHeight - 4);
        // Inner decorative border
        borderGraphics.lineStyle(2, 0xDEB887, 0.6); // Light brown
        borderGraphics.strokeRect(6, 6, gameWidth - 12, gameHeight - 12);
    }
    drawGrid() {
        const gameWidth = this.gridWidth * this.gridSize;
        const gameHeight = this.gridHeight * this.gridSize;
        const gridGraphics = this.add.graphics();
        // Main grid lines - more visible
        gridGraphics.lineStyle(1.5, 0x999999, 0.7);
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
        // Add subtle inner grid lines for better cell definition
        gridGraphics.lineStyle(0.5, 0xBBBBBB, 0.4);
        for (let x = 1; x < this.gridWidth; x++) {
            const xPos = x * this.gridSize;
            gridGraphics.moveTo(xPos + 1, 1);
            gridGraphics.lineTo(xPos + 1, gameHeight - 1);
        }
        for (let y = 1; y < this.gridHeight; y++) {
            const yPos = y * this.gridSize;
            gridGraphics.moveTo(1, yPos + 1);
            gridGraphics.lineTo(gameWidth - 1, yPos + 1);
        }
        gridGraphics.strokePath();
        // Add grid coordinates for better navigation (every 4th line)
        const coordStyle = {
            fontSize: '10px',
            color: '#666666',
            alpha: 0.6
        };
        for (let x = 0; x <= this.gridWidth; x += 4) {
            if (x > 0) {
                this.add.text(x * this.gridSize + 2, 2, x.toString(), coordStyle);
            }
        }
        for (let y = 0; y <= this.gridHeight; y += 4) {
            if (y > 0) {
                this.add.text(2, y * this.gridSize + 2, y.toString(), coordStyle);
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
                // Babies get hungry and sleepy over time
                entity.setData('hunger', Math.min(100, hunger + 8));
                entity.setData('sleepy', Math.min(100, sleepy + 10));
                // Update baby color based on state
                if (hunger > 80) {
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
        // Update needs over time
        human.setData('hunger', Math.min(100, hunger + 5));
        human.setData('tiredness', Math.min(100, tiredness + 3));
        // Stress increases if needs are high
        if (hunger > 70 || tiredness > 70) {
            human.setData('stress', Math.min(100, stress + 5));
        }
        else {
            human.setData('stress', Math.max(0, stress - 2));
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
                baby.setData('hunger', Math.max(0, hunger - 50));
                baby.setData('happiness', Math.min(100, baby.getData('happiness') + 20));
                baby.setData('sleepy', Math.min(100, baby.getData('sleepy') + 30));
                this.resources.formula--;
                const humanName = human.getData('name');
                this.showMessage(`${humanName} fed ${task.targetName}!`);
                this.updateResourceDisplay();
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
            baby.setData('sleepy', Math.max(0, sleepy - 60));
            baby.setData('happiness', Math.min(100, baby.getData('happiness') + 30));
            baby.setData('hunger', Math.min(100, baby.getData('hunger') + 20));
            const humanName = human.getData('name');
            this.showMessage(`${humanName} helped ${task.targetName} sleep!`);
            baby.setFillStyle(0x9370DB);
        }
    }
    executeTaskComfort(human, task) {
        const baby = this.entities.get(task.targetId);
        if (baby) {
            const happiness = baby.getData('happiness');
            baby.setData('happiness', Math.min(100, happiness + 15));
            const humanName = human.getData('name');
            this.showMessage(`${humanName} comforted ${task.targetName}!`);
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
        const text = `Money: $${this.resources.money} | Diapers: ${this.resources.diapers} | Formula: ${this.resources.formula} | Food: ${this.resources.food}`;
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
