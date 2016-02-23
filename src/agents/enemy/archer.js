var ARCHER_ATTR = {
    IDLE_LEFT : 0,
    IDLE_RIGHT : 1,
    ATK_STRAIGHT_LEFT : 2,
    ATK_STRAIGHT_RIGHT : 3,
    ATK_DOWN_LEFT : 4,
    ATK_DOWN_RIGHT : 5,
    ATK_UP_LEFT : 6,
    ATK_UP_RIGHT : 7,

    VISION_RADIUS : 520,
    STARTING_HEALTH : 4,
    SHOOTING_TIME : 2,

    ARROW_SPEED : 7
}

function Archer (x, y, game, level) {
    Enemy.call(this, x, y, 73, 64, ARCHER_ATTR.STARTING_HEALTH, 0, 0, level);
    this.currentY_px -= 15;
    this.game = game;
    this.timeDurationNextArrow = ARCHER_ATTR.SHOOTING_TIME;
    this.visionRadius = ARCHER_ATTR.VISION_RADIUS;

    var archerImg = AM.getAsset("./img/enemy/archer.png");
    var archerRight = new Animation(archerImg, 73, 64, 0.05, true);
    var archerLeft = new Animation(archerImg, 73, 64, 0.05, true);
    var archerLeftShooting = new Animation(archerImg, 73, 64, 0.2, false);
    var archerRightShooting = new Animation(archerImg, 73, 64, 0.2, false);
    var archerLeftShootingDown = new Animation(archerImg, 73, 64, 0.2, false);
    var archerRightShootingDown = new Animation(archerImg, 73, 64, 0.2, false);
    var archerLeftShootingUp = new Animation(archerImg, 73, 64, 0.2, false);
    var archerRightShootingUp = new Animation(archerImg, 73, 64, 0.2, false);
    archerRight.addFrame(73, 0);
    archerLeft.addFrame(0, 0);
    archerLeftShooting.addFrame(0, 64, 3);
    archerRightShooting.addFrame(0, 128, 3);
    archerLeftShootingDown.addFrame(0, 192, 3);
    archerRightShootingDown.addFrame(0, 256, 3);
    archerLeftShootingUp.addFrame(0, 320, 3);
    archerRightShootingUp.addFrame(0, 384, 3);

    this.animationList.push(archerLeft);
    this.animationList.push(archerRight);
    this.animationList.push(archerLeftShooting);
    this.animationList.push(archerRightShooting);
    this.animationList.push(archerLeftShootingDown);
    this.animationList.push(archerRightShootingDown);
    this.animationList.push(archerLeftShootingUp);
    this.animationList.push(archerRightShootingUp);

    this.removeFromWorld = false;
}

Archer.prototype = new Enemy();
Archer.prototype.constructor = Archer;

Archer.prototype.setAnimationFromAngle = function (angle) {
    if (angle >= Math.PI / (-6) && angle <= Math.PI / 6) {   // [-30, 30] degree
        this.currentAnimation = ARCHER_ATTR.ATK_STRAIGHT_RIGHT;
    } else if (angle > Math.PI / 6 && angle <= Math.PI / 2) {   // (30, 90] degree
        this.currentAnimation = ARCHER_ATTR.ATK_UP_RIGHT;
    } else if (angle > Math.PI / 2 && angle < 5 * Math.PI / 6) {   // (90, 150) degree
        this.currentAnimation = ARCHER_ATTR.ATK_UP_LEFT;
    } else if (angle >= 5 * Math.PI / 6 || angle <= (-5) * Math.PI / 6) {
        this.currentAnimation = ARCHER_ATTR.ATK_STRAIGHT_LEFT;
    } else if (angle > (-5) * Math.PI / 6 && angle <= Math.PI / (-2)) {    // (-150, -90] degree
        this.currentAnimation = ARCHER_ATTR.ATK_DOWN_LEFT;
    } else {
        this.currentAnimation = ARCHER_ATTR.ATK_DOWN_RIGHT;
    }
};

Archer.prototype.attackKnightInRange = function (tick, posX, posY, width, height) {
    var playerCenter = {
        x : posX + Math.floor(width / 2),
        y : posY + Math.floor(height / 2)
    };

    var archerCenter = {
        x : this.currentX_px + Math.floor(this.width / 2),
        y : this.currentY_px + Math.floor(this.height / 2)
    };

    var distanceX = playerCenter.x - archerCenter.x;
    var distanceY = playerCenter.y - archerCenter.y;
    var angle = Math.atan2(-distanceY, distanceX);
    var distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
    // check if the knight is in the vision radius (450 px), count down the shooting time.
    if (distance < this.visionRadius) {
        if (this.timeDurationNextArrow === ARCHER_ATTR.SHOOTING_TIME) {
            this.setAnimationFromAngle(angle);
        }
        this.timeDurationNextArrow -= tick;
        if (this.timeDurationNextArrow <= 0) {
            this.timeDurationNextArrow = ARCHER_ATTR.SHOOTING_TIME;
        }
    }
    // after finishing atk animation, create an arrow and set back to idle animation.
    if (this.currentAnimation !== ARCHER_ATTR.IDLE_LEFT && this.currentAnimation !== ARCHER_ATTR.IDLE_RIGHT) {
        if (this.animationList[this.currentAnimation].isDone()) {
            this.animationList[this.currentAnimation].elapsedTime = 0;
            var arrow = new Arrow(archerCenter.x, archerCenter.y, distanceX, distanceY, angle, this.level);
            this.level.enemies.push(arrow);
            this.game.addEntity(arrow);
            if (posX > this.currentX_px) {
                this.currentAnimation = ARCHER_ATTR.IDLE_RIGHT;
            } else {
                this.currentAnimation = ARCHER_ATTR.IDLE_LEFT;
            }
        }
    }
};

Archer.prototype.update = function (tick, posX, posY, width, height) {
    this.moveY(this.yVelocity);
    if (this.health <= 0) {
        this.removeFromWorld = true;
    }
    if (this.isBeingAttacked) {
        this.gotAttacked(tick);
    }
    this.attackKnightInRange(tick, posX, posY, width, height);
    Enemy.prototype.update.call(this);
};

Archer.prototype.draw = function (ctx, cameraRect, tick) {
    Enemy.prototype.draw.call(this, ctx, cameraRect, tick);
    var percent = this.health / 4;
    if (percent > 0.4) {
        ctx.fillStyle = "green";
    } else {
        ctx.fillStyle = "red";
    }
    ctx.fillRect(this.currentX_px - cameraRect.left, this.currentY_px - cameraRect.top - 20,
                    this.width * percent, 5);
};

function Arrow (x, y, distanceX, distanceY, angle, level) {
    Entity.call(this, x, y, 25, 5);
    this.centerX = x;
    this.centerY = y;
    this.maxVel = ARCHER_ATTR.ARROW_SPEED;
    var scale = this.maxVel / Math.sqrt(distanceX * distanceX + distanceY * distanceY);
    this.xVel = distanceX * scale;
    this.yVel = distanceY * scale;
    this.angle = angle;
    this.level = level;
    this.width = 25;
    this.height = 5;

    var arrowRight = new Animation(AM.getAsset("./img/enemy/archer.png"), this.width, this.height, 0.2, true);
    arrowRight.addFrame(146, 5);

    this.animationList.push(arrowRight);

    this.removeFromWorld = false;
}

Arrow.prototype = {
    gotAttacked : function () {}, // do nothing, knight still gets hit when atking the arrow.

    update : function () {
        var tempX = this.centerX + this.xVel;
        var tempY = this.centerY + this.yVel;
        if (!this.level.obstacleAt(tempX - (this.width / 2), tempY - (this.height / 2),
                this.width, this.height)) {
            this.centerX = tempX;
            this.centerY = tempY;
        } else {
            this.removeFromWorld = true;
        }
        this.currentX_px = this.centerX;
        this.currentY_px = this.centerY;
        Entity.prototype.update.call(this);
    },

    draw : function (ctx, cameraRect, tick) {
        ctx.save();
        ctx.translate(this.centerX - cameraRect.left, this.centerY - cameraRect.top);
        ctx.rotate(-this.angle);
        this.animationList[this.currentAnimation].drawFrame(tick,
                            ctx, - (this.width / 2), - (this.height / 2));
        ctx.restore();
    }
}
