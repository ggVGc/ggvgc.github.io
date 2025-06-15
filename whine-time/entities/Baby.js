(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./GameEntity"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Baby = void 0;
    const GameEntity_1 = require("./GameEntity");
    class Baby extends GameEntity_1.GameEntity {
        constructor(id, position, name) {
            const initialData = {
                name,
                needs: {
                    hunger: 60,
                    cleanliness: 80,
                    comfort: 70,
                    sleepiness: 40
                },
                lastFed: 0,
                lastChanged: 0,
                isSleeping: false,
                age: 0,
                specialNeeds: {
                    sensitiveFormula: Math.random() < 0.3, // 30% chance
                    gasIssues: Math.random() < 0.4, // 40% chance
                    colicLevel: Math.floor(Math.random() * 5) // 0-4
                }
            };
            super(id, 'baby', position, initialData);
        }
        createSprite(scene, x, y) {
            this.sprite = scene.add.rectangle(x, y, 48, 48, this.getSpriteColor());
            this.sprite.setStrokeStyle(2, 0x000000);
            this.sprite.setInteractive();
            this.sprite.on('pointerdown', () => this.onClick());
            // Add name label
            scene.add.text(x, y - 30, this.data.name, {
                fontSize: '12px',
                color: '#000000'
            }).setOrigin(0.5);
        }
        update(deltaTime) {
            const timeMultiplier = deltaTime / 1000;
            this.data.age += timeMultiplier / 3600; // Convert to hours
            if (!this.data.isSleeping) {
                // Babies get hungry faster
                this.data.needs.hunger = Math.min(100, this.data.needs.hunger + timeMultiplier * 3);
                // Cleanliness decreases over time
                this.data.needs.cleanliness = Math.max(0, this.data.needs.cleanliness - timeMultiplier * 1);
                // Comfort decreases if needs aren't met
                if (this.data.needs.hunger > 70 || this.data.needs.cleanliness < 30) {
                    this.data.needs.comfort = Math.max(0, this.data.needs.comfort - timeMultiplier * 2);
                }
                // Sleepiness increases
                this.data.needs.sleepiness = Math.min(100, this.data.needs.sleepiness + timeMultiplier * 2);
                // Auto-sleep when very sleepy
                if (this.data.needs.sleepiness > 90 && this.data.needs.comfort > 50) {
                    this.data.isSleeping = true;
                }
            }
            else {
                // Sleeping baby recovers sleepiness and comfort
                this.data.needs.sleepiness = Math.max(0, this.data.needs.sleepiness - timeMultiplier * 4);
                this.data.needs.comfort = Math.min(100, this.data.needs.comfort + timeMultiplier * 2);
                // Wake up if hungry or uncomfortable
                if (this.data.needs.hunger > 80 || this.data.needs.cleanliness < 20) {
                    this.data.isSleeping = false;
                }
            }
            // Update sprite color based on state
            if (this.sprite) {
                this.sprite.setFillStyle(this.getSpriteColor());
            }
        }
        getSpriteColor() {
            if (this.data.isSleeping) {
                return 0x9370DB; // Purple when sleeping
            }
            else if (this.data.needs.hunger > 80 || this.data.needs.cleanliness < 20) {
                return 0xFF6B6B; // Red when upset
            }
            else if (this.data.needs.comfort > 80 && this.data.needs.hunger < 30) {
                return 0x98FB98; // Light green when happy
            }
            else {
                return 0xFFB6C1; // Pink normal state
            }
        }
        onClick() {
            console.log(`Clicked on ${this.data.name}`);
            // This will be handled by the game scene
        }
        getStatusText() {
            const needs = this.data.needs;
            let status = `${this.data.name}:\n`;
            status += `Hunger: ${Math.round(needs.hunger)}\n`;
            status += `Clean: ${Math.round(needs.cleanliness)}\n`;
            status += `Comfort: ${Math.round(needs.comfort)}\n`;
            status += `Sleepy: ${Math.round(needs.sleepiness)}\n`;
            status += `Status: ${this.data.isSleeping ? 'Sleeping' : 'Awake'}`;
            if (this.data.specialNeeds?.sensitiveFormula) {
                status += '\nNeeds sensitive formula';
            }
            return status;
        }
        feed(feedType) {
            if (this.data.needs.hunger < 20)
                return false; // Not hungry enough
            let effectiveness = 40;
            // Special formula needs
            if (this.data.specialNeeds?.sensitiveFormula && feedType !== 'sensitiveFormula') {
                effectiveness = 20; // Less effective
                // Might cause discomfort
                this.data.needs.comfort = Math.max(0, this.data.needs.comfort - 10);
            }
            this.data.needs.hunger = Math.max(0, this.data.needs.hunger - effectiveness);
            this.data.lastFed = Date.now();
            // Babies often fall asleep while feeding
            if (Math.random() < 0.7) {
                this.data.isSleeping = true;
                this.data.needs.sleepiness = Math.max(0, this.data.needs.sleepiness - 20);
            }
            return true;
        }
        changeDiaper() {
            if (this.data.needs.cleanliness > 80)
                return false; // Doesn't need changing
            this.data.needs.cleanliness = 100;
            this.data.needs.comfort = Math.min(100, this.data.needs.comfort + 15);
            this.data.lastChanged = Date.now();
            return true;
        }
        comfort() {
            this.data.needs.comfort = Math.min(100, this.data.needs.comfort + 20);
            // Comforting can help with sleep
            if (this.data.needs.sleepiness > 60) {
                this.data.needs.sleepiness = Math.min(100, this.data.needs.sleepiness + 10);
            }
        }
    }
    exports.Baby = Baby;
});
//# sourceMappingURL=Baby.js.map