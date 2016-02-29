function Enemy (x, y, width, height, health, xVel, yVel, level) {
    Entity.call(this, x, y, width, height);
    this.health = health;
    this.maxHealth = health;
    this.spawnX = this.currentX_px;
    this.spawnY = this.currentY_px;
    this.xVelocity = xVel;
    this.yVelocity = yVel;
    this.level = level;
    this.isBeingAttacked = false;
    this.isAlive = true;
    this.invulnerableTime = GAME_CONSTANT.INVULNERABLE_TIME;
    this.removeFromWorld = false;
}

Enemy.prototype = new Entity();
Enemy.prototype.constructor = Enemy;

Enemy.prototype.knockback = function (xVel, yVel) {
    this.moveX(xVel);
    if (this.invulnerableTime === GAME_CONSTANT.INVULNERABLE_TIME) {
        this.yVelocity = yVel;
    }
    this.moveY();
}

Enemy.prototype.gotAttacked = function (tick, knockback) {
    if (this.isAlive) {
        this.isBeingAttacked = true;
        if (this.invulnerableTime === GAME_CONSTANT.INVULNERABLE_TIME) {
            if (knockback) {
                this.health -= GAME_CONSTANT.DAMAGE;
                this.knockback = knockback;
                this.yVelocity = knockback.y;
            }
        }
        this.moveX(this.knockback.x);
        this.moveY();
        this.invulnerableTime -= tick;
        if (this.invulnerableTime <= 0) {
            this.invulnerableTime = GAME_CONSTANT.INVULNERABLE_TIME;
            this.isBeingAttacked = false;
        }
    }
};

Enemy.prototype.moveX = function (xVel) {
    var tempX = this.currentX_px + xVel;
    var obstacle = this.level.obstacleAt(tempX, this.currentY_px, this.width, this.height);
    if (!obstacle) {
        this.currentX_px = tempX;
    }
};

Enemy.prototype.moveY = function () {
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
};

Enemy.prototype.draw = function (ctx, cameraRect, tick) {
    if (this.isAlive) {
        Entity.prototype.draw.call(this, ctx, cameraRect, tick);
        // var percent = this.health / 6;
        // if (percent > 0.4) {
        //     ctx.fillStyle = "green";
        // } else {
        //     ctx.fillStyle = "red";
        // }
        // ctx.fillRect(this.currentX_px - cameraRect.left, this.currentY_px - cameraRect.top - 10,
        //                 this.width * percent, 5);
    } else {
        var centerX = this.currentX_px + Math.floor(this.width / 2);
        var centerY = this.currentY_px + Math.floor(this.height / 2);
        var xAnimDie = centerX - 15;
        var yAnimDie = centerY - 15;
        this.animationList[this.currentAnimation].drawFrame(tick,
                            ctx, xAnimDie - cameraRect.left, yAnimDie - cameraRect.top, 0, 0, 2);
    }
}
