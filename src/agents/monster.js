var ARCHER_ATTR = {
    IDLE_LEFT : 0,
    IDLE_RIGHT : 1,
    ATK_STRAIGHT_LEFT : 2,
    ATK_STRAIGHT_RIGHT : 3,
    ATK_DOWN_LEFT : 4,
    ATK_DOWN_RIGHT : 5,
    ATK_UP_LEFT : 6,
    ATK_UP_RIGHT : 7,

    VISION_RADIUS : 450,
    ARCHER_HEALTH : 4,
    SHOOTING_TIME : 2,

    ARROW_SPEED : 7
}

function Skeleton (x, y, level) {
    Entity.call(this, x, y, 31, 59);
    this.currentY_px -= 10;
    this.level = level;

    this.health = 6;
    this.yVelocity = 0;
    this.xVelocity = -3;

    this.attentionDistance = 400;
    this.verticalDistance = 250
    this.isChasing = false;

    this.destination = null;

    var skeletonImg = AM.getAsset("./img/enemy/chaser.png");
    var skeletonRight = new Animation(skeletonImg, 31, 59, 0.2, true);
    var skeletonLeft = new Animation(skeletonImg, 31, 59, 0.2, true);
    var skeletonRunningRight = new Animation(skeletonImg, 52, 59, 0.2, true);
    var skeletonRunningLeft = new Animation(skeletonImg, 52, 59, 0.2, true);
    skeletonRight.addFrame(31, 0);
    skeletonLeft.addFrame(0, 0);
    skeletonRunningRight.addFrame(0, 118, 3);
    skeletonRunningLeft.addFrame(0, 59, 3);

    this.animationList.push(skeletonRight);
    this.animationList.push(skeletonLeft);
    this.animationList.push(skeletonRunningRight);
    this.animationList.push(skeletonRunningLeft);
    this.currentAnimation = GAME_CONSTANT.STANDING_LEFT_ANIMATION;
    this.removeFromWorld = false;
}

Skeleton.prototype = {
    moveX : function () {
        var tempX = this.currentX_px + this.xVelocity;
        var obstacle = this.level.obstacleAt(tempX, this.currentY_px, this.width, this.height);
        if (!obstacle) {
            this.currentX_px = tempX;
        }
    },

    moveY : function () {
        if (this.yVelocity < GAME_CONSTANT.TERMINAL_VELOCITY) {
            this.yVelocity += GAME_CONSTANT.Y_ACCELERATION;
        }
        var tempY = this.currentY_px + this.yVelocity;
        var obstacle = this.level.obstacleAt(this.currentX_px, tempY, this.width, this.height);
        if (!obstacle) {
            this.currentY_px = tempY;
        } else {
            this.yVelocity = 0;
            if (this.currentY_px < obstacle.currentY_px) {
                this.currentY_px = obstacle.currentY_px - this.height - 0.1;
            }
        }
    },

    update : function (tick, posX, posY, width, height) {
        this.moveY();
        if (this.isChasing) {
            this.moveX();
            // offset for the position of skeleton and knight.
            if (Math.abs(this.currentX_px - this.destination.x) <= 2 &&
                Math.abs(this.currentY_px - this.destination.y) <= 9) {
                this.isChasing = false;
            }
        } else { // stand by and check for the player
            if (this.currentAnimation === GAME_CONSTANT.RUNNING_RIGHT_ANIMATION) {
                this.currentAnimation = GAME_CONSTANT.STANDING_RIGHT_ANIMATION;
            } else {
                this.currentAnimation = GAME_CONSTANT.STANDING_LEFT_ANIMATION;
            }
            // console.log(Math.abs(this.currentX_px - posX) <= this.attentionDistance);
            // console.log(posY - this.currentY_px <= this.verticalDistance);
            // console.log(posY - this.currentY_px >= 0);
            if (Math.abs(this.currentX_px - posX) <= this.attentionDistance &&
                    posY - this.currentY_px <= this.verticalDistance && posY - this.currentY_px >= 0) {
                this.isChasing = true;
                this.destination = {x : posX, y : posY};
                if (this.currentX_px > posX) {
                    this.currentAnimation = GAME_CONSTANT.RUNNING_LEFT_ANIMATION;
                    if (this.xVelocity > 0) this.xVelocity *= -1;
                } else {
                    this.currentAnimation = GAME_CONSTANT.RUNNING_RIGHT_ANIMATION;
                    if (this.xVelocity < 0) this.xVelocity *= -1;
                }
            }
        }
        Entity.prototype.update.call(this);
    },

    draw : function (ctx, cameraRect, tick) {
        Entity.prototype.draw.call(this, ctx, cameraRect, tick);
        var percent = this.health / 6;
        if (percent > 0.4) {
            ctx.fillStyle = "green";
        } else {
            ctx.fillStyle = "red";
        }
        ctx.fillRect(this.currentX_px - cameraRect.left, this.currentY_px - cameraRect.top - 10,
                        this.width * percent, 5);
    }
};

function Archer (x, y, game, level) {
    Entity.call(this, x, y, 73, 64);
    this.currentY_px -= 14;
    this.game = game;
    this.level = level;
    this.yVelocity = 0;
    this.xVelocity = 0;
    this.timeDurationNextArrow = ARCHER_ATTR.SHOOTING_TIME;
    this.visionRadius = 520;
    this.health = 4;

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

Archer.prototype = {
    setAnimationFromAngle : function (angle) {
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
    },

    update : function (tick, posX, posY, width, height) {
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
                if (this.game.player.currentX_px > this.currentX_px) {
                    this.currentAnimation = ARCHER_ATTR.IDLE_RIGHT;
                } else {
                    this.currentAnimation = ARCHER_ATTR.IDLE_LEFT;
                }
            }
        }
        Entity.prototype.update.call(this);
    },

    draw : function (ctx, cameraRect, tick) {
        Entity.prototype.draw.call(this, ctx, cameraRect, tick);
        var percent = this.health / 4;
        if (percent > 0.4) {
            ctx.fillStyle = "green";
        } else {
            ctx.fillStyle = "red";
        }
        ctx.fillRect(this.currentX_px - cameraRect.left, this.currentY_px - cameraRect.top - 20,
                        this.width * percent, 5);
    }
}

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

function Wisp (x, y, level) {
    Entity.call(this, x, y, 44, 50);
    this.level = level;

    var wispRight = new Animation(AM.getAsset("./img/enemy/wispChaser mockup.png"), 44, 50, 0.05, true);
    wispRight.addFrame(44, 0);
    var wispLeft = new Animation(AM.getAsset("./img/enemy/wispChaser mockup.png"), 44, 50, 0.05, true);
    wispLeft.addFrame(0, 0);

    this.animationList.push(wispRight);
    this.animationList.push(wispLeft);

    this.isFollowing = false;
    this.removeFromWorld = false;
}

Wisp.prototype = {
    update : function(tick, x, y, width, height) {
        if (x > this.currentX_px) {
            this.currentAnimation = 0;
        } else {
            this.currentAnimation = 1;
        }
        if (this.isFollowing) {
            for (var i = 0; i < this.level.enemies.length; i += 1) {
                if (this.level.enemies[i] === this) {
                    this.level.enemies.splice(i, 1);
                    break;
                }
            }
        }
        Entity.prototype.update.call(this);
    },

    draw : function(ctx, cameraRect, tick) {
        Entity.prototype.draw.call(this, ctx, cameraRect, tick);
    }
}
