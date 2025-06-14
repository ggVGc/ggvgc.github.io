export interface Resources {
    money: number;
    diapers: number;
    formula: number;
    sensitiveFormula: number;
    bottles: number;
    food: number;
    breastMilk: number;
    cleanBottles: number;
    dirtyBottles: number;
    electricity: number;
    water: number;
}
export interface Loans {
    totalDebt: number;
    interestRate: number;
    maxLoanAmount: number;
    dailyInterest: number;
}
export interface Shop {
    diapers: {
        price: number;
        quantity: number;
    };
    formula: {
        price: number;
        quantity: number;
    };
    sensitiveFormula: {
        price: number;
        quantity: number;
    };
    bottles: {
        price: number;
        quantity: number;
    };
    food: {
        price: number;
        quantity: number;
    };
}
export declare class ResourceManager {
    private resources;
    private loans;
    private shop;
    private gameTime;
    private lastBillTime;
    constructor();
    getResources(): Resources;
    getLoans(): Loans;
    getShop(): Shop;
    updateTime(deltaTime: number): void;
    private payDailyInterest;
    private payUtilityBills;
    canAfford(item: keyof Shop, quantity?: number): boolean;
    buyItem(item: keyof Shop, quantity?: number): boolean;
    takeLoan(amount: number): boolean;
    repayLoan(amount: number): boolean;
    work(): {
        success: boolean;
        earnings: number;
        message: string;
    };
    useResource(resource: keyof Resources, amount: number): boolean;
    addResource(resource: keyof Resources, amount: number): void;
    washBottles(): boolean;
    sterilizeBottles(): boolean;
    pumpBreastMilk(): boolean;
    feedWithBreastMilk(): boolean;
    getGameTime(): number;
    getDayOfGame(): number;
    getTimeOfDay(): string;
    getFinancialStatus(): string;
    getCriticalResources(): string[];
}
//# sourceMappingURL=ResourceManager.d.ts.map