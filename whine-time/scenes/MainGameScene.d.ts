import Phaser from 'phaser';
export declare class MainGameScene extends Phaser.Scene {
    private grid;
    private selectedEntity;
    private placementMode;
    private statusText;
    private resourceText;
    private gameTimer;
    private resources;
    constructor();
    create(): void;
    private drawGrid;
    private createUI;
    private createPlacementButtons;
    private placeInitialEntities;
    private placeEntity;
    private setupInputHandlers;
    private handlePlacement;
    private handleSelection;
    private getEntityFromItem;
    private handleEntityInteraction;
    private handleBabyInteraction;
    private feedBaby;
    private changeBabyDiaper;
    private handleHumanInteraction;
    private handleFeedingStationInteraction;
    private showEntityStatus;
    private updateGame;
    private updateResourceDisplay;
    private showMessage;
}
//# sourceMappingURL=MainGameScene.d.ts.map