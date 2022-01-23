let config = {
    type: Phaser.AUTO,
    width: 1920,
    height: 872,
    rows: 6,
    cols: 6,
    scene: new GameScene()
};

let game = new Phaser.Game(config);