import { GameEntity, EntityData } from './GameEntity';
import { GridPosition } from '../Grid';
export interface HumanNeeds {
    hunger: number;
    tiredness: number;
    stress: number;
}
export interface Task {
    id: string;
    type: string;
    targetId?: string;
    priority: number;
    estimatedTime: number;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
}
export interface HumanData extends EntityData {
    name: string;
    gender: 'male' | 'female';
    needs: HumanNeeds;
    tasks: Task[];
    currentTask?: Task | undefined;
    skills: {
        caregiving: number;
        efficiency: number;
        multitasking: number;
    };
    isBreastfeeding: boolean;
    brainDamage: number;
    sleepHoursLast24h: number[];
}
export declare class Human extends GameEntity {
    data: HumanData;
    constructor(id: string, position: GridPosition, name: string, gender: 'male' | 'female');
    createSprite(scene: Phaser.Scene, x: number, y: number): void;
    update(deltaTime: number): void;
    private getSpriteColor;
    private processCurrentTask;
    onClick(): void;
    getStatusText(): string;
    addTask(task: Task): boolean;
    canBreastfeed(): boolean;
    startBreastfeeding(): boolean;
    stopBreastfeeding(): void;
    eat(): boolean;
    sleep(hours: number): boolean;
    isResting(): boolean;
    getEfficiency(): number;
}
//# sourceMappingURL=Human.d.ts.map