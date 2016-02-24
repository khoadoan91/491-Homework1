function Enemy (x, y, width, height, health, xVel, yVel, level) {
    Entity.call(this, x, y, width, height);
    this.health = health;
    this.xVelocity = xVel;
    this.yVelocity = yVel;
    this.level = level;
    this.isBeingAttacked = false;
    this.invulnerableTime = GAME_CONSTANT.INVULNERABLE_TIME;
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
};

Enemy.prototype.moveX = function (xVel) {
    var tempX = this.currentX_px + xVel;
    var obstacle = this.level.obstacleAt(tempX, this.currentY_px, this.width, this.height);
    if (!obstacle) {
        this.currentX_px = tempX;
    }
};

Enemy.prototype.moveY = function (yVel) {
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
