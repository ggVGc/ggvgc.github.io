(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ResourceManager = void 0;
    class ResourceManager {
        constructor() {
            this.resources = {
                money: 500,
                diapers: 20,
                formula: 10,
                sensitiveFormula: 5,
                bottles: 8,
                food: 15,
                breastMilk: 0,
                cleanBottles: 6,
                dirtyBottles: 2,
                electricity: 1000, // Starting with 1000 kWh
                water: 500 // Starting with 500 liters
            };
            this.loans = {
                totalDebt: 0,
                interestRate: 0.05, // 5% annual
                maxLoanAmount: 2000,
                dailyInterest: 0
            };
            this.shop = {
                diapers: { price: 15, quantity: 50 },
                formula: { price: 25, quantity: 12 },
                sensitiveFormula: { price: 45, quantity: 6 },
                bottles: { price: 8, quantity: 4 },
                food: { price: 12, quantity: 20 }
            };
            this.gameTime = 0;
            this.lastBillTime = 0;
        }
        getResources() {
            return { ...this.resources };
        }
        getLoans() {
            return { ...this.loans };
        }
        getShop() {
            return { ...this.shop };
        }
        updateTime(deltaTime) {
            this.gameTime += deltaTime / 3600000; // Convert ms to hours
            // Pay daily interest
            if (Math.floor(this.gameTime / 24) > Math.floor(this.lastBillTime / 24)) {
                this.payDailyInterest();
                this.payUtilityBills();
                this.lastBillTime = this.gameTime;
            }
        }
        payDailyInterest() {
            if (this.loans.totalDebt > 0) {
                const dailyInterest = this.loans.totalDebt * (this.loans.interestRate / 365);
                this.loans.dailyInterest = dailyInterest;
                this.resources.money -= dailyInterest;
            }
        }
        payUtilityBills() {
            // Electricity bill (higher cost during night time for heating/cooling)
            const electricityUsed = Math.max(0, 1000 - this.resources.electricity);
            const electricityBill = electricityUsed * 0.12; // $0.12 per kWh
            // Water bill
            const waterUsed = Math.max(0, 500 - this.resources.water);
            const waterBill = waterUsed * 0.003; // $0.003 per liter
            const totalBill = electricityBill + waterBill;
            this.resources.money -= totalBill;
            // Reset utilities for next day
            this.resources.electricity = 1000;
            this.resources.water = 500;
        }
        canAfford(item, quantity = 1) {
            const cost = this.shop[item].price * quantity;
            return this.resources.money >= cost;
        }
        buyItem(item, quantity = 1) {
            if (!this.canAfford(item, quantity)) {
                return false;
            }
            const cost = this.shop[item].price * quantity;
            this.resources.money -= cost;
            switch (item) {
                case 'diapers':
                    this.resources.diapers += quantity;
                    break;
                case 'formula':
                    this.resources.formula += quantity;
                    break;
                case 'sensitiveFormula':
                    this.resources.sensitiveFormula += quantity;
                    break;
                case 'bottles':
                    this.resources.bottles += quantity;
                    this.resources.cleanBottles += quantity;
                    break;
                case 'food':
                    this.resources.food += quantity;
                    break;
            }
            return true;
        }
        takeLoan(amount) {
            if (this.loans.totalDebt + amount > this.loans.maxLoanAmount) {
                return false;
            }
            this.loans.totalDebt += amount;
            this.resources.money += amount;
            return true;
        }
        repayLoan(amount) {
            if (this.resources.money < amount || amount > this.loans.totalDebt) {
                return false;
            }
            this.resources.money -= amount;
            this.loans.totalDebt -= amount;
            return true;
        }
        work() {
            // Working requires good health and time
            const baseEarnings = 100;
            const timeRequirement = 8; // 8 hours
            // Reduce earnings based on various factors
            let earnings = baseEarnings;
            let message = '';
            // Deduct work time from the day
            this.gameTime += timeRequirement;
            this.resources.money += earnings;
            return {
                success: true,
                earnings,
                message: `Worked for ${timeRequirement} hours and earned $${earnings}`
            };
        }
        useResource(resource, amount) {
            if (this.resources[resource] < amount) {
                return false;
            }
            this.resources[resource] -= amount;
            return true;
        }
        addResource(resource, amount) {
            this.resources[resource] += amount;
        }
        washBottles() {
            if (this.resources.dirtyBottles === 0) {
                return false;
            }
            // Washing bottles takes water and electricity
            const bottlesToWash = this.resources.dirtyBottles;
            const waterNeeded = bottlesToWash * 2; // 2 liters per bottle
            const electricityNeeded = bottlesToWash * 1; // 1 kWh per bottle (for hot water)
            if (this.resources.water < waterNeeded || this.resources.electricity < electricityNeeded) {
                return false;
            }
            this.resources.water -= waterNeeded;
            this.resources.electricity -= electricityNeeded;
            this.resources.cleanBottles += bottlesToWash;
            this.resources.dirtyBottles = 0;
            return true;
        }
        sterilizeBottles() {
            if (this.resources.cleanBottles === 0) {
                return false;
            }
            // Sterilizing requires electricity
            const bottlesToSterilize = this.resources.cleanBottles;
            const electricityNeeded = bottlesToSterilize * 2; // 2 kWh per bottle
            if (this.resources.electricity < electricityNeeded) {
                return false;
            }
            this.resources.electricity -= electricityNeeded;
            // Clean bottles become ready for use (no separate counter, just tracked in cleanBottles)
            return true;
        }
        pumpBreastMilk() {
            // Pumping breast milk requires clean bottles and electricity
            if (this.resources.cleanBottles === 0) {
                return false;
            }
            const electricityNeeded = 5; // 5 kWh for pumping session
            if (this.resources.electricity < electricityNeeded) {
                return false;
            }
            this.resources.electricity -= electricityNeeded;
            this.resources.cleanBottles -= 1;
            this.resources.dirtyBottles += 1;
            this.resources.breastMilk += 120; // 120ml per session
            return true;
        }
        feedWithBreastMilk() {
            const amountNeeded = 60; // 60ml per feeding
            if (this.resources.breastMilk < amountNeeded) {
                return false;
            }
            this.resources.breastMilk -= amountNeeded;
            return true;
        }
        getGameTime() {
            return this.gameTime;
        }
        getDayOfGame() {
            return Math.floor(this.gameTime / 24) + 1;
        }
        getTimeOfDay() {
            const hourOfDay = this.gameTime % 24;
            const hour = Math.floor(hourOfDay);
            const minute = Math.floor((hourOfDay - hour) * 60);
            return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        }
        getFinancialStatus() {
            let status = `Money: $${Math.round(this.resources.money)}\n`;
            if (this.loans.totalDebt > 0) {
                status += `Debt: $${Math.round(this.loans.totalDebt)}\n`;
                status += `Daily Interest: $${Math.round(this.loans.dailyInterest * 100) / 100}`;
            }
            else {
                status += 'No debt';
            }
            return status;
        }
        getCriticalResources() {
            const critical = [];
            if (this.resources.diapers < 3)
                critical.push('diapers');
            if (this.resources.formula < 2 && this.resources.sensitiveFormula < 1)
                critical.push('formula');
            if (this.resources.food < 2)
                critical.push('food');
            if (this.resources.cleanBottles < 2)
                critical.push('clean bottles');
            if (this.resources.money < 50)
                critical.push('money');
            return critical;
        }
    }
    exports.ResourceManager = ResourceManager;
});
//# sourceMappingURL=ResourceManager.js.map