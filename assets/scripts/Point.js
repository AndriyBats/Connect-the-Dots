class Point extends Phaser.GameObjects.Sprite {
    constructor(scene, value) {
        super(scene, 0, 0,  'point' + value);
        this.scene = scene;
        this.value = value;
        this.setOrigin(0, 0);
        this.scene.add.existing(this);
        this.setInteractive();
    }
    init(position) {
        this.position = position;
        this.setPosition(position.x, -this.height);
    }
    move(params) {
        this.scene.tweens.add({
            targets: this,
            x: params.x,
            y: params.y,
            delay: params.delay,
            ease: 'Linear',
            duration: 200,
            onComplete: () => {
            }
        });
    }
}