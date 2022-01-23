class GameScene extends Phaser.Scene {
    constructor() {
        super("Game");
    }
    preload() {
        this.load.image('bg', 'assets/sprites/background.jpg');
        this.load.image('point1', 'assets/sprites/blue1.png');
        this.load.image('point2', 'assets/sprites/green1.png');
        this.load.image('point3', 'assets/sprites/purple1.png');
        this.load.image('point4', 'assets/sprites/red1.png');
        this.load.image('point5', 'assets/sprites/yelow1.png');
    }
    createText() {
        this.pointsText = this.add.text(1500, 30, "POINTS: 0", {
            font: '36px Arial',
            fill: '#ffffff'
        })
    }
    create() {
        this.positions = [];
        this.createBackground();
        this.createText();
        this.createPoints();
        this.getPointsPositions()
        this.initPoints();
        this.showPoints();
        this.graphics = this.add.graphics();
        this.line = new Phaser.Geom.Line();
        this.colorLine = null;
        this.pathArray = [];
        this.currentPoint = {};
        this.toDeletePoints = [];
        this.countPoints = 0;
        this.toDroppPoints = [];   
    }
    createBackground() {
        this.add.sprite(0, 0, 'bg').setOrigin(0, 0);
    }
    createPoints() {
        this.points = [];

        for (let i=0; i<config.rows; i++) {
            for (let j = 0; j < config.cols; j++) {
                let color = Math.ceil(10 * Math.random() / 2)
                this.points.push(new Point(this, color));
            }
        }   

        this.input.on("gameobjectdown", this.onPointClicked, this);
        this.input.on("gameobjectmove", this.onPointMove, this);
        this.input.on("gameobjectover", this.onPointOver, this);
        this.input.on("gameobjectout", this.onPointOut, this);
    }

    initPoints() { 
        for(let i=0; i<this.positions.length; i++){
            this.points[i].init(this.positions[35-i])
        }
    }

    showPoints() {
        this.points.forEach(point => {
            point.move({
                x: point.position.x,
                y: point.position.y,
                delay: point.position.delay
            });
        });
    }

    onPointClicked(pointer, point) {
        this.startPoint = point;
        this.previousPoint = point;
        this.getColor(point);
        this.line.setTo(pointer.x, pointer.y, pointer.x, pointer.y);
        this.toDeletePoints.push(point);
    }
    onPointMove(pointer, point) {
        if (pointer.isDown) {
            this.drawCurrentLine(pointer);
            this.drawPath(this.startPoint, this.colorLine);
        } else if (this.toDeletePoints.length >= 2) {
            this.graphics.clear();
            this.disappearancePoints()
        } else {
            this.graphics.clear();
            this.toDeletePoints = [];
            this.pathArray = [];
        }
    }

    onPointOver(pointer, point) {
        if (pointer.isDown) {
            this.searchPoints(pointer, point);
        }
    }

    searchPoints(pointer, point) {
        if (point.value === this.previousPoint.value && point !== this.previousPoint) {
            if ((point.x === this.previousPoint.x && (point.y === this.previousPoint.y - 2 * point.width || point.y === this.previousPoint.y + 2 * point.width)) || (point.y === this.previousPoint.y && (point.x === this.previousPoint.x - 2 * point.width || point.x === this.previousPoint.x + 2 * point.width))) {
                if (this.toDeletePoints.includes(point) === false) {
                    let newPoint = {
                        x: point.x + point.width / 2,
                        y: point.y + point.width / 2
                    };
                    this.pathArray.push(newPoint);
                    this.line.setTo(newPoint.x, newPoint.y, pointer.x, pointer.y);
                    this.toDeletePoints.push(point);
                    this.currentPoint = point;
                }
            }
        } else if (point === this.previousPoint) {
            this.toDeletePoints.pop();
            this.pathArray.pop();
            this.previousPoint = this.toDeletePoints[this.toDeletePoints.length - 1];
            this.line.setTo(this.previousPoint.x + point.width / 2, this.previousPoint.y + point.width / 2, pointer.x, pointer.y);
            this.currentPoint = this.previousPoint;
        }
    }

    onPointOut(pointer, point) {
        if (pointer.isDown && point === this.currentPoint) {
            this.previousPoint = point;
        }
    }

    drawCurrentLine(pointer) {
        this.line.x2 = pointer.x;
        this.line.y2 = pointer.y;
        this.graphics.clear();
        this.graphics.lineStyle(10, this.colorLine);
        this.graphics.strokeLineShape(this.line);
    }

    drawPath(point, color) {
        this.graphics.lineStyle(10, color, 1);
        this.graphics.beginPath();
        this.graphics.moveTo(point.x + point.width / 2, point.y + point.width / 2);
        for (let i = 0; i < this.pathArray.length; i++) {
            this.graphics.lineTo(this.pathArray[i].x, this.pathArray[i].y);
        }
        this.graphics.strokePath();
    }

    disappearancePoints() {      
        this.toDeletePoints.forEach(elem => {
            for (let i = 0; i < this.points.length; i++) {
                if (elem === this.points[i]) {
                    this.points[i].destroy();
                    this.points.splice(i, 1, {})
                }
            }
        });
        this.droppingPoints();
    }

    droppingPoints() {
        for (let i = 0; i < this.points.length; i++) {
            if (this.points[i].value === undefined && i<30) {
                let step =6;
                while(i+step < 36){
                    if (this.points[i+step].value !== undefined ) {
                        this.points[i+step].move({
                            x: this.points[i+step].x,
                            y: this.points[i+step].y + step / 6 * this.points[i+step].height * 2,
                        });
                        this.points.splice(i, 1, this.points[i+step]);
                        this.points[i].y = this.points[i+step].y; 
                        this.points.splice(i+step, 1, {});
                        break   
                    }
                    step+=6; 
                }                           
            }
        }
        this.countPoints += this.toDeletePoints.length;
        this.toDeletePoints = [];
        this.pathArray = [];
        this.pointsText.setText("POINTS: " + this.countPoints);
        this.filling();
    }

    filling() {
        for(let i = 0; i < this.points.length; i++){
            if (this.points[i].value === undefined) {
                let color = Math.ceil(10 * Math.random() / 2);
                let newPoint = new Point(this, color);
                this.points.splice(i, 1, newPoint);
                newPoint.init({
                    x: this.positions[35-i].x,
                    y: this.positions[35-i].y,
                    delay: 10
                })
                newPoint.move({
                    x: this.positions[35-i].x,
                    y: this.positions[35-i].y,
                });
            }
        }
    }

    getColor(point) {
        if (point.value === 1) {
            this.colorLine = 0x3333ff;
        } else if (point.value === 2) {
            this.colorLine = 0x33cc33;
        } else if (point.value === 3) {
            this.colorLine = 0xcc00cc;
        } else if (point.value === 4) {
            this.colorLine = 0xff3300;
        } else if (point.value === 5) {
            this.colorLine = 0xffff00;
        }
        return this.colorLine
    }

    getPointsPositions() {
        let pointTexture = this.textures.get('point1').getSourceImage();
        let pointWidth = pointTexture.width + 50;
        let pointHeight = pointTexture.height + 50;
        let offsetX = (this.sys.game.config.width - pointWidth * config.cols) / 2;
        let offsetY = (this.sys.game.config.height - pointHeight * config.rows) / 2;

        let id = this.points.length;
        for (let row = 0; row < config.rows; row++) {
            for (let col = 0; col < config.cols; col++) {
                --id;
                this.positions.push({
                    x: offsetX + col * pointWidth,
                    y: offsetY + row * pointHeight,
                    delay: id * 40
                });
            }
        }       
    }
}