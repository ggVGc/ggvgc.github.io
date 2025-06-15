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
    exports.Human = void 0;
    const GameEntity_1 = require("./GameEntity");
    class Human extends GameEntity_1.GameEntity {
        constructor(id, position, name, gender) {
            const initialData = {
                name,
                gender,
                needs: {
                    hunger: 50,
                    tiredness: 30,
                    stress: 20
                },
                tasks: [],
                skills: {
                    caregiving: 50 + Math.random() * 30, // 50-80
                    efficiency: 50 + Math.random() * 30,
                    multitasking: 30 + Math.random() * 40
                },
                isBreastfeeding: false,
                brainDamage: 0,
                sleepHoursLast24h: Array(24).fill(1) // Assume 1 hour sleep per hour initially
            };
            super(id, 'human', position, initialData);
        }
        createSprite(scene, x, y) {
            const color = this.data.gender === 'female' ? 0xFF69B4 : 0x4169E1;
            this.sprite = scene.add.rectangle(x, y, 40, 60, color);
            this.sprite.setStrokeStyle(2, 0x000000);
            this.sprite.setInteractive();
            this.sprite.on('pointerdown', () => this.onClick());
            // Add name label
            scene.add.text(x, y - 40, this.data.name, {
                fontSize: '12px',
                color: '#000000'
            }).setOrigin(0.5);
        }
        update(deltaTime) {
            const timeMultiplier = deltaTime / 1000;
            // Update needs
            this.data.needs.hunger = Math.min(100, this.data.needs.hunger + timeMultiplier * 1.5);
            if (!this.isResting()) {
                this.data.needs.tiredness = Math.min(100, this.data.needs.tiredness + timeMultiplier * 1);
            }
            // Stress increases with high needs and screaming babies
            if (this.data.needs.hunger > 70 || this.data.needs.tiredness > 70) {
                this.data.needs.stress = Math.min(100, this.data.needs.stress + timeMultiplier * 2);
            }
            else {
                this.data.needs.stress = Math.max(0, this.data.needs.stress - timeMultiplier * 0.5);
            }
            // Process current task
            if (this.data.currentTask) {
                this.processCurrentTask(timeMultiplier);
            }
            else if (this.data.tasks.length > 0) {
                // Start next task
                const nextTask = this.data.tasks.shift();
                if (nextTask) {
                    this.data.currentTask = nextTask;
                    this.data.currentTask.status = 'in_progress';
                }
            }
            // Update sprite color based on state
            if (this.sprite) {
                this.sprite.setFillStyle(this.getSpriteColor());
            }
        }
        getSpriteColor() {
            const baseColor = this.data.gender === 'female' ? 0xFF69B4 : 0x4169E1;
            if (this.data.isBreastfeeding) {
                return 0x90EE90; // Light green when breastfeeding
            }
            else if (this.data.needs.tiredness > 80 || this.data.needs.hunger > 80) {
                return 0xFF6B6B; // Red when struggling
            }
            else if (this.data.needs.stress > 70) {
                return 0xFFA500; // Orange when stressed
            }
            else {
                return baseColor;
            }
        }
        processCurrentTask(deltaTime) {
            if (!this.data.currentTask)
                return;
            // Task efficiency based on tiredness, hunger, and skills
            let efficiency = 1.0;
            efficiency *= (100 - this.data.needs.tiredness) / 100;
            efficiency *= (100 - this.data.needs.hunger) / 100;
            efficiency *= (100 - this.data.brainDamage) / 100;
            efficiency *= this.data.skills.efficiency / 100;
            // Random chance of task failure if too exhausted
            if (this.data.needs.tiredness > 90 && Math.random() < 0.1) {
                this.data.currentTask.status = 'failed';
                this.data.currentTask = undefined;
                return;
            }
            this.data.currentTask.estimatedTime -= deltaTime * efficiency;
            if (this.data.currentTask.estimatedTime <= 0) {
                this.data.currentTask.status = 'completed';
                this.data.currentTask = undefined;
            }
        }
        onClick() {
            console.log(`Clicked on ${this.data.name}`);
        }
        getStatusText() {
            const needs = this.data.needs;
            let status = `${this.data.name} (${this.data.gender}):\n`;
            status += `Hunger: ${Math.round(needs.hunger)}\n`;
            status += `Tired: ${Math.round(needs.tiredness)}\n`;
            status += `Stress: ${Math.round(needs.stress)}\n`;
            if (this.data.brainDamage > 0) {
                status += `Brain Damage: ${Math.round(this.data.brainDamage)}\n`;
            }
            if (this.data.currentTask) {
                status += `Task: ${this.data.currentTask.type}`;
            }
            else if (this.data.tasks.length > 0) {
                status += `Tasks queued: ${this.data.tasks.length}`;
            }
            else {
                status += 'Idle';
            }
            return status;
        }
        addTask(task) {
            // Limit tasks based on tiredness and multitasking skill
            const maxTasks = Math.max(1, Math.floor(this.data.skills.multitasking / 20) - Math.floor(this.data.needs.tiredness / 30));
            if (this.data.tasks.length >= maxTasks) {
                return false;
            }
            this.data.tasks.push(task);
            this.data.tasks.sort((a, b) => b.priority - a.priority); // Sort by priority
            return true;
        }
        canBreastfeed() {
            return this.data.gender === 'female' && !this.data.isBreastfeeding && !this.data.currentTask;
        }
        startBreastfeeding() {
            if (!this.canBreastfeed())
                return false;
            this.data.isBreastfeeding = true;
            return true;
        }
        stopBreastfeeding() {
            this.data.isBreastfeeding = false;
        }
        eat() {
            if (this.data.needs.hunger < 20)
                return false;
            this.data.needs.hunger = Math.max(0, this.data.needs.hunger - 40);
            return true;
        }
        sleep(hours) {
            if (hours <= 0)
                return false;
            const recoveryAmount = hours * 20;
            this.data.needs.tiredness = Math.max(0, this.data.needs.tiredness - recoveryAmount);
            // Track sleep for brain damage calculation
            this.data.sleepHoursLast24h.shift();
            this.data.sleepHoursLast24h.push(hours);
            // Calculate brain damage from sleep deprivation
            const totalSleep = this.data.sleepHoursLast24h.reduce((sum, h) => sum + h, 0);
            if (totalSleep < 4) {
                this.data.brainDamage = Math.min(100, this.data.brainDamage + 1);
            }
            return true;
        }
        isResting() {
            return this.data.currentTask?.type === 'sleep' || this.data.isBreastfeeding;
        }
        getEfficiency() {
            let efficiency = this.data.skills.efficiency / 100;
            efficiency *= (100 - this.data.needs.tiredness) / 100;
            efficiency *= (100 - this.data.needs.hunger) / 100;
            efficiency *= (100 - this.data.brainDamage) / 100;
            return Math.max(0.1, efficiency);
        }
    }
    exports.Human = Human;
});
//# sourceMappingURL=Human.js.map