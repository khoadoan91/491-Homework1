var WISP_ATTR = {
    STARTING_HEALTH : 4,
    VISION_RADIUS : 500,
    VELOCITY : 2,
}

function Wisp (x, y, level) {
    Enemy.call(this, x, y, 44, 50, WISP_ATTR.STARTING_HEALTH, -WISP_ATTR.VELOCITY, WISP_ATTR.VELOCITY, level);
    this.currentY_px -= 0.1
    this.vision = WISP_ATTR.VISION_RADIUS;
    this.isChasing = false;
    this.destination = null;

    var wispRight = new Animation(AM.getAsset("./img/enemy/wisp.png"), 44, 50, 0.2, true);
    wispRight.addFrame(0, 50, 4);
    var wispLeft = new Animation(AM.getAsset("./img/enemy/wisp.png"), 44, 50, 0.2, true);
    wispLeft.addFrame(0, 0, 4);
    var wispDie = new Animation(AM.getAsset("./img/enemy/death anim.png"), 15, 15, 0.2, false);
    wispDie.addFrame(0, 0, 7);

    this.animationList.push(wispRight);
    this.animationList.push(wispLeft);
    this.animationList.push(wispDie);
}

Wisp.prototype = new Enemy();
Wisp.prototype.constructor = Wisp;

Wisp.prototype.reset = function () {
    this.isChasing = false;
    this.destination = null;
    Enemy.prototype.reset.call(this);
};

Wisp.prototype.chaseKnightInVision = function (posX, posY, width, height) {
    var playerCenter = {
        x : posX + Math.floor(width / 2),
        y : posY + Math.floor(height / 2)
    };

    var wispCenter = {
        x : this.currentX_px + Math.floor(this.width / 2),
        y : this.currentY_px + Math.floor(this.height / 2)
    };

    var distanceX = playerCenter.x - wispCenter.x;
    var distanceY = playerCenter.y - wispCenter.y;
    var distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
    // check if the knight is in the vision radius (550 px).
    if (distance < this.vision) {
        this.isChasing = true;
        this.destination = {x : posX, y : posY};
    }
    if (this.currentX_px > posX) {
        this.currentAnimation = 1;
        if (this.xVelocity > 0) this.xVelocity *= -1;
    } else {
        this.currentAnimation = 0;
        if (this.xVelocity < 0) this.xVelocity *= -1;
    }
    if ((posY > this.currentY_px && this.yVelocity < 0) ||
        (posY < this.currentY_px && this.yVelocity > 0)) {
        this.yVelocity *= -1;
    }
};

Wisp.prototype.moveY = function () {
    this.currentY_px = this.currentY_px + this.yVelocity;
};

Wisp.prototype.moveX = function () {
    this.currentX_px = this.currentX_px + this.xVelocity;
};

Wisp.prototype.update = function(tick, posX, posY, width, height) {
    if (this.health <= 0) {
        this.isAlive = false;
        this.currentAnimation = 2;
    }
    if (this.isAlive) {
        if (this.isBeingAttacked) {
            this.gotAttacked(tick);
        } else {    // if the wisp is not being attacked, do some behavior
            if (this.isChasing) {
                this.moveX();
                this.moveY();
                // console.log(this.currentX_px + " " + this.currentY_px);
                // offset for the position of skeleton and knight.
                if (Math.abs(this.currentX_px - this.destination.x) <= 3 &&
                    Math.abs(this.currentY_px - this.destination.y) <= 3) {
                    this.isChasing = false;
                }
            }
            // check for the knight near by
            this.chaseKnightInVision(posX, posY, width, height);
        }
        Enemy.prototype.update.call(this);
    } else {
        if (this.animationList[2].isDone()) {
            this.animationList[2].elapsedTime = 0;
            this.removeFromWorld = true;
        }
    }
};

Wisp.prototype.draw = function (ctx, cameraRect, tick) {
    Enemy.prototype.draw.call(this, ctx, cameraRect, tick);
    if (this.isAlive) {
        var percent = this.health / 6;
        if (percent > 0.4) {
            ctx.fillStyle = "green";
        } else {
            ctx.fillStyle = "red";
        }
        ctx.fillRect(this.currentX_px - cameraRect.left, this.currentY_px - cameraRect.top - 10,
                        this.width * percent, 5);
    }
}
