import { GameState } from '../GameState.js';
export class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene' });
        this.resourceTexts = {};
        this.needsTexts = {};
        this.babyNeedsTexts = {};
    }
    init(data) {
        this.gameState = data.gameState;
    }
    create() {
        this.createResourceDisplay();
        this.createNeedsDisplay();
        this.createActionButtons();
        this.time.addEvent({
            delay: 100,
            callback: this.updateUI,
            callbackScope: this,
            loop: true
        });
    }
    createResourceDisplay() {
        const startY = 20;
        const lineHeight = 25;
        this.add.text(20, startY, 'Resources:', { fontSize: '18px', color: '#000000', fontStyle: 'bold' });
        const resources = ['money', 'diapers', 'babyFormula', 'bottles', 'babyClothes', 'sleepHours'];
        resources.forEach((resource, index) => {
            const label = resource.charAt(0).toUpperCase() + resource.slice(1).replace(/([A-Z])/g, ' $1');
            this.add.text(20, startY + 30 + index * lineHeight, `${label}:`, { fontSize: '14px', color: '#000000' });
            this.resourceTexts[resource] = this.add.text(150, startY + 30 + index * lineHeight, '0', { fontSize: '14px', color: '#000000' });
        });
    }
    createNeedsDisplay() {
        const startY = 220;
        this.add.text(20, startY, 'Your Needs:', { fontSize: '18px', color: '#000000', fontStyle: 'bold' });
        this.add.text(20, startY + 30, 'Hunger:', { fontSize: '14px', color: '#000000' });
        this.needsTexts.hunger = this.add.text(90, startY + 30, '0%', { fontSize: '14px', color: '#000000' });
        this.add.text(20, startY + 55, 'Tiredness:', { fontSize: '14px', color: '#000000' });
        this.needsTexts.tiredness = this.add.text(110, startY + 55, '0%', { fontSize: '14px', color: '#000000' });
        // Baby needs
        this.add.text(20, startY + 100, 'Baby Needs:', { fontSize: '18px', color: '#000000', fontStyle: 'bold' });
        const babyNeeds = ['hunger', 'cleanliness', 'comfort', 'sleepiness'];
        babyNeeds.forEach((need, index) => {
            const label = need.charAt(0).toUpperCase() + need.slice(1);
            this.add.text(20, startY + 130 + index * 25, `${label}:`, { fontSize: '14px', color: '#000000' });
            this.babyNeedsTexts[need] = this.add.text(120, startY + 130 + index * 25, '0%', { fontSize: '14px', color: '#000000' });
        });
    }
    createActionButtons() {
        const buttonStyle = {
            fontSize: '14px',
            color: '#FFFFFF',
            backgroundColor: '#4CAF50',
            padding: { x: 10, y: 5 }
        };
        const startX = 300;
        const startY = 20;
        const buttonHeight = 40;
        // Player actions
        this.add.text(startX, startY, 'Player Actions:', { fontSize: '16px', color: '#000000', fontStyle: 'bold' });
        const eatButton = this.add.text(startX, startY + 30, 'Eat ($10)', buttonStyle)
            .setInteractive()
            .on('pointerdown', () => this.playerEat());
        const sleepButton = this.add.text(startX, startY + 70, 'Sleep (1h)', buttonStyle)
            .setInteractive()
            .on('pointerdown', () => this.playerSleep());
        const workButton = this.add.text(startX, startY + 110, 'Work (+$50)', buttonStyle)
            .setInteractive()
            .on('pointerdown', () => this.work());
        // Baby actions
        this.add.text(startX, startY + 170, 'Baby Actions:', { fontSize: '16px', color: '#000000', fontStyle: 'bold' });
        const feedBabyButton = this.add.text(startX, startY + 200, 'Feed Baby', { ...buttonStyle, backgroundColor: '#FF9800' })
            .setInteractive()
            .on('pointerdown', () => this.feedBaby());
        const changeDiaperButton = this.add.text(startX, startY + 240, 'Change Diaper', { ...buttonStyle, backgroundColor: '#FF9800' })
            .setInteractive()
            .on('pointerdown', () => this.changeDiaper());
        // Money actions
        this.add.text(startX, startY + 300, 'Money:', { fontSize: '16px', color: '#000000', fontStyle: 'bold' });
        const loanButton = this.add.text(startX, startY + 330, 'Take Loan ($100)', { ...buttonStyle, backgroundColor: '#F44336' })
            .setInteractive()
            .on('pointerdown', () => this.takeLoan());
        // Shopping
        this.add.text(startX, startY + 390, 'Shop:', { fontSize: '16px', color: '#000000', fontStyle: 'bold' });
        const buyDiapersButton = this.add.text(startX, startY + 420, 'Buy Diapers ($20)', { ...buttonStyle, backgroundColor: '#9C27B0' })
            .setInteractive()
            .on('pointerdown', () => this.buyDiapers());
        const buyFormulaButton = this.add.text(startX, startY + 460, 'Buy Formula ($15)', { ...buttonStyle, backgroundColor: '#9C27B0' })
            .setInteractive()
            .on('pointerdown', () => this.buyFormula());
        // Items/Upgrades
        this.add.text(startX, startY + 520, 'Items:', { fontSize: '16px', color: '#000000', fontStyle: 'bold' });
        const buyFormulaMakerButton = this.add.text(startX, startY + 550, 'Formula Maker ($200)', { ...buttonStyle, backgroundColor: '#795548' })
            .setInteractive()
            .on('pointerdown', () => this.buyFormulaMaker());
        const buyWhiteNoiseButton = this.add.text(startX, startY + 590, 'White Noise ($150)', { ...buttonStyle, backgroundColor: '#795548' })
            .setInteractive()
            .on('pointerdown', () => this.buyWhiteNoise());
        const useFormulaMakerButton = this.add.text(startX, startY + 630, 'Use Formula Maker', { ...buttonStyle, backgroundColor: '#607D8B' })
            .setInteractive()
            .on('pointerdown', () => this.useFormulaMaker());
    }
    updateUI() {
        // Update resources
        const resources = this.gameState.resources;
        Object.keys(this.resourceTexts).forEach(key => {
            const value = resources[key];
            this.resourceTexts[key].setText(value.toString());
        });
        // Update player needs
        this.needsTexts.hunger.setText(`${Math.round(this.gameState.playerNeeds.hunger)}%`);
        this.needsTexts.tiredness.setText(`${Math.round(this.gameState.playerNeeds.tiredness)}%`);
        // Update baby needs
        const baby = this.gameState.babies[0];
        Object.keys(this.babyNeedsTexts).forEach(key => {
            const value = baby.needs[key];
            this.babyNeedsTexts[key].setText(`${Math.round(value)}%`);
        });
    }
    playerEat() {
        const success = this.gameState.playerEat();
        this.showMessage(success ? 'You ate!' : 'Not enough money!');
    }
    playerSleep() {
        const success = this.gameState.playerSleep(1);
        this.showMessage(success ? 'You slept for 1 hour!' : 'Not enough sleep hours!');
    }
    work() {
        const success = this.gameState.work();
        this.showMessage(success ? 'You worked and earned $50!' : 'Too tired to work!');
    }
    feedBaby() {
        const success = this.gameState.feedBaby('1', 'formula');
        this.showMessage(success ? 'Fed the baby!' : 'No formula available!');
    }
    changeDiaper() {
        const success = this.gameState.changeDiaper('1');
        this.showMessage(success ? 'Changed diaper!' : 'No diapers available!');
    }
    takeLoan() {
        const success = this.gameState.takeLoan(100);
        this.showMessage(success ? 'Took $100 loan!' : 'Cannot take more loans!');
    }
    buyDiapers() {
        if (this.gameState.resources.money >= 20) {
            this.gameState.resources.money -= 20;
            this.gameState.resources.diapers += 10;
            this.showMessage('Bought 10 diapers!');
        }
        else {
            this.showMessage('Not enough money!');
        }
    }
    buyFormula() {
        if (this.gameState.resources.money >= 15) {
            this.gameState.resources.money -= 15;
            this.gameState.resources.babyFormula += 5;
            this.showMessage('Bought 5 formula units!');
        }
        else {
            this.showMessage('Not enough money!');
        }
    }
    buyFormulaMaker() {
        const success = this.gameState.buyItem('formulaMaker');
        this.showMessage(success ? 'Bought Formula Maker!' : 'Cannot buy (not enough money or already owned)!');
    }
    buyWhiteNoise() {
        const success = this.gameState.buyItem('whiteNoiseMachine');
        this.showMessage(success ? 'Bought White Noise Machine!' : 'Cannot buy (not enough money or already owned)!');
    }
    useFormulaMaker() {
        const success = this.gameState.useFormulaMaker();
        this.showMessage(success ? 'Made 3 formula units!' : 'Cannot use (not owned, no uses left, or low water)!');
    }
    showMessage(text) {
        const message = this.add.text(512, 100, text, {
            fontSize: '20px',
            color: '#000000',
            backgroundColor: '#FFFFFF',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5);
        this.time.delayedCall(2000, () => {
            message.destroy();
        });
    }
}
