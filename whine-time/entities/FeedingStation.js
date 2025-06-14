import { GameEntity } from './GameEntity';
export class FeedingStation extends GameEntity {
    constructor(id, position, formulaType = 'regular') {
        const initialData = {
            formulaType,
            formulaAmount: 0,
            needsCleaning: false,
            usesBeforeCleaning: 4,
            maxUses: 4,
            waterLevel: 100,
            maxWater: 100
        };
        super(id, 'feeding_station', position, initialData);
    }
    createSprite(scene, x, y) {
        const color = this.data.formulaType === 'sensitive' ? 0x87CEEB : 0x4682B4;
        this.sprite = scene.add.rectangle(x, y, 56, 56, color);
        this.sprite.setStrokeStyle(2, 0x000000);
        this.sprite.setInteractive();
        this.sprite.on('pointerdown', () => this.onClick());
        // Add icon or label
        scene.add.text(x, y, 'FS', {
            fontSize: '16px',
            color: '#FFFFFF',
            fontStyle: 'bold'
        }).setOrigin(0.5);
    }
    update(deltaTime) {
        // Update sprite color based on status
        if (this.sprite) {
            let color = this.data.formulaType === 'sensitive' ? 0x87CEEB : 0x4682B4;
            if (this.data.needsCleaning) {
                color = 0x8B4513; // Brown when needs cleaning
            }
            else if (this.data.waterLevel < 20) {
                color = 0xFF6B6B; // Red when low water
            }
            else if (this.data.formulaAmount === 0) {
                color = 0xFFA500; // Orange when no formula
            }
            this.sprite.setFillStyle(color);
        }
    }
    onClick() {
        console.log(`Clicked on feeding station ${this.id}`);
    }
    getStatusText() {
        let status = `Feeding Station (${this.data.formulaType}):\n`;
        status += `Formula: ${this.data.formulaAmount} bottles\n`;
        status += `Water: ${Math.round(this.data.waterLevel)}%\n`;
        status += `Uses left: ${this.data.usesBeforeCleaning}/${this.data.maxUses}\n`;
        if (this.data.needsCleaning) {
            status += 'NEEDS CLEANING!';
        }
        else if (this.data.waterLevel < 20) {
            status += 'LOW WATER!';
        }
        else if (this.data.formulaAmount === 0) {
            status += 'NO FORMULA!';
        }
        else {
            status += 'Ready';
        }
        return status;
    }
    makeFormula() {
        if (this.data.needsCleaning || this.data.waterLevel < 20 || this.data.usesBeforeCleaning <= 0) {
            return false;
        }
        this.data.formulaAmount += 3; // Makes 3 bottles
        this.data.waterLevel -= 20;
        this.data.usesBeforeCleaning--;
        if (this.data.usesBeforeCleaning <= 0) {
            this.data.needsCleaning = true;
        }
        return true;
    }
    clean() {
        if (!this.data.needsCleaning)
            return false;
        this.data.needsCleaning = false;
        this.data.usesBeforeCleaning = this.data.maxUses;
        return true;
    }
    refillWater() {
        if (this.data.waterLevel >= this.data.maxWater)
            return false;
        this.data.waterLevel = this.data.maxWater;
        return true;
    }
    takeFormula() {
        if (this.data.formulaAmount <= 0)
            return false;
        this.data.formulaAmount--;
        return true;
    }
}
//# sourceMappingURL=FeedingStation.js.map