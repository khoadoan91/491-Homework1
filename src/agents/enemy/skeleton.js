var SKELETON_ATTR = {
    STARTING_HEALTH : 10,
    RUNNING_SPEED : -3,
    ATTENTION : 400,
    VERTICAL_DISTANCE : 250
}

function Skeleton (x, y, level) {
    Enemy.call(this, x, y, 31, 59, SKELETON_ATTR.STARTING_HEALTH, SKELETON_ATTR.RUNNING_SPEED, 0, level);
    this.currentY_px -= 10;

    this.attentionDistance = SKELETON_ATTR.ATTENTION;
    this.verticalDistance = SKELETON_ATTR.VERTICAL_DISTANCE;
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

Skeleton.prototype = new Enemy();
Skeleton.prototype.constructor = Skeleton;

Skeleton.prototype.setIdleAnimation = function () {
    if (this.currentAnimation === GAME_CONSTANT.RUNNING_RIGHT_ANIMATION) {
        this.currentAnimation = GAME_CONSTANT.STANDING_RIGHT_ANIMATION;
    } else {
        this.currentAnimation = GAME_CONSTANT.STANDING_LEFT_ANIMATION;
    }
};

Skeleton.prototype.scanKnightNearBy = function (posX, posY) {
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
};

Skeleton.prototype.update = function (tick, posX, posY, width, height) {
    this.moveY();
    if (this.health <= 0) {
        this.removeFromWorld = true;
    }
    if (this.isBeingAttacked) {
        this.gotAttacked(tick);
        this.setIdleAnimation();
    } else {    // if the skeleton is not being attacked, do some behavior
        if (this.isChasing) {
            this.moveX();
            // offset for the position of skeleton and knight.
            if (Math.abs(this.currentX_px - this.destination.x) <= 2 &&
                Math.abs(this.currentY_px - this.destination.y) <= 9) {
                this.isChasing = false;
            }
        } else { // stand by
            this.setIdleAnimation(posX, posY);
        }
        // check for the knight near by
        this.scanKnightNearBy(posX, posY);
    }
    Enemy.prototype.update.call(this);
};

Skeleton.prototype.draw = function (ctx, cameraRect, tick) {
    Enemy.prototype.draw.call(this, ctx, cameraRect, tick);
    var percent = this.health / 6;
    if (percent > 0.4) {
        ctx.fillStyle = "green";
    } else {
        ctx.fillStyle = "red";
    }
    ctx.fillRect(this.currentX_px - cameraRect.left, this.currentY_px - cameraRect.top - 10,
                    this.width * percent, 5);
};
