export class GameState {
    constructor() {
        this.resources = {
            bottles: 2,
            babyClothes: 5,
            diapers: 10,
            babyFormula: 5,
            sleepHours: 8,
            money: 100
        };
        this.playerNeeds = {
            hunger: 50,
            tiredness: 30
        };
        this.babies = [
            {
                id: '1',
                name: 'Baby',
                needs: {
                    hunger: 60,
                    cleanliness: 80,
                    comfort: 70,
                    sleepiness: 40
                },
                lastFed: 0,
                lastChanged: 0,
                isSleeping: false
            }
        ];
        this.items = {
            formulaMaker: {
                owned: false,
                usesLeft: 0,
                waterLevel: 0
            },
            whiteNoiseMachine: {
                owned: false,
                isOn: false
            }
        };
        this.loans = {
            totalDebt: 0,
            interestRate: 0.05,
            maxLoanAmount: 1000
        };
        this.gameTime = 0;
        this.isOnLeave = true;
        this.leaveTimeRemaining = 30;
    }
    updateNeeds(deltaTime) {
        const timeMultiplier = deltaTime / 1000;
        // Update player needs
        this.playerNeeds.hunger = Math.min(100, this.playerNeeds.hunger + timeMultiplier * 2);
        this.playerNeeds.tiredness = Math.min(100, this.playerNeeds.tiredness + timeMultiplier * 1.5);
        // Update baby needs
        this.babies.forEach(baby => {
            if (!baby.isSleeping) {
                baby.needs.hunger = Math.min(100, baby.needs.hunger + timeMultiplier * 3);
                baby.needs.cleanliness = Math.max(0, baby.needs.cleanliness - timeMultiplier * 1);
                baby.needs.comfort = Math.max(0, baby.needs.comfort - timeMultiplier * 1.5);
                baby.needs.sleepiness = Math.min(100, baby.needs.sleepiness + timeMultiplier * 2);
            }
            else {
                baby.needs.sleepiness = Math.max(0, baby.needs.sleepiness - timeMultiplier * 4);
                baby.needs.comfort = Math.min(100, baby.needs.comfort + timeMultiplier * 2);
            }
        });
        this.gameTime += deltaTime;
    }
    feedBaby(babyId, feedingMethod) {
        const baby = this.babies.find(b => b.id === babyId);
        if (!baby)
            return false;
        if (feedingMethod === 'formula' && this.resources.babyFormula <= 0) {
            return false;
        }
        baby.needs.hunger = Math.max(0, baby.needs.hunger - 40);
        baby.lastFed = this.gameTime;
        if (feedingMethod === 'formula') {
            this.resources.babyFormula--;
        }
        return true;
    }
    changeDiaper(babyId) {
        const baby = this.babies.find(b => b.id === babyId);
        if (!baby || this.resources.diapers <= 0)
            return false;
        baby.needs.cleanliness = 100;
        baby.lastChanged = this.gameTime;
        this.resources.diapers--;
        return true;
    }
    playerEat() {
        if (this.resources.money < 10)
            return false;
        this.playerNeeds.hunger = Math.max(0, this.playerNeeds.hunger - 50);
        this.resources.money -= 10;
        return true;
    }
    playerSleep(hours) {
        if (this.resources.sleepHours < hours)
            return false;
        this.playerNeeds.tiredness = Math.max(0, this.playerNeeds.tiredness - hours * 20);
        this.resources.sleepHours -= hours;
        return true;
    }
    work() {
        if (this.playerNeeds.tiredness > 80)
            return false;
        this.resources.money += 50;
        this.playerNeeds.tiredness += 30;
        return true;
    }
    takeLoan(amount) {
        if (this.loans.totalDebt + amount > this.loans.maxLoanAmount)
            return false;
        this.loans.totalDebt += amount;
        this.resources.money += amount;
        return true;
    }
    checkGameOver() {
        // Game over if player is too stressed or baby is neglected
        const baby = this.babies[0];
        return (this.playerNeeds.hunger >= 100 && this.playerNeeds.tiredness >= 100) ||
            (baby.needs.hunger >= 100 && baby.needs.cleanliness <= 0);
    }
    checkWinCondition() {
        // Win by staying on leave forever (simplified: survive for a long time)
        return this.gameTime > 300000 && this.isOnLeave;
    }
    updateLeaveStatus() {
        // Lose leave if you don't have enough babies or money runs too low
        if (this.babies.length < Math.floor(this.gameTime / 60000) + 1 || this.resources.money < -500) {
            this.isOnLeave = false;
        }
        // Pay interest on loans
        if (this.loans.totalDebt > 0) {
            const interest = this.loans.totalDebt * this.loans.interestRate / 365;
            this.resources.money -= interest;
        }
    }
    addBaby() {
        const newBabyId = (this.babies.length + 1).toString();
        this.babies.push({
            id: newBabyId,
            name: `Baby ${newBabyId}`,
            needs: {
                hunger: 50,
                cleanliness: 100,
                comfort: 80,
                sleepiness: 30
            },
            lastFed: this.gameTime,
            lastChanged: this.gameTime,
            isSleeping: false
        });
    }
    buyItem(itemName) {
        const costs = {
            formulaMaker: 200,
            whiteNoiseMachine: 150
        };
        if (this.resources.money < costs[itemName] || this.items[itemName].owned) {
            return false;
        }
        this.resources.money -= costs[itemName];
        this.items[itemName].owned = true;
        if (itemName === 'formulaMaker') {
            this.items.formulaMaker.usesLeft = 4;
            this.items.formulaMaker.waterLevel = 100;
        }
        return true;
    }
    useFormulaMaker() {
        if (!this.items.formulaMaker.owned ||
            this.items.formulaMaker.usesLeft <= 0 ||
            this.items.formulaMaker.waterLevel < 20) {
            return false;
        }
        this.items.formulaMaker.usesLeft--;
        this.items.formulaMaker.waterLevel -= 20;
        this.resources.babyFormula += 3;
        return true;
    }
}
