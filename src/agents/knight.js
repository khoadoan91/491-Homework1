function Knight (x, y, game, level) {
    Entity.call(this, x, y, 41, 50);
    this.level = level;
    this.game = game;
    this.xVelocity = 0;
    this.yVelocity = 0;
    this.checkPointX = this.currentX_px;
    this.checkPointY = this.currentY_px;
    this.atkHitBoxesRight = new SwordHitBox(1, -0.6);
    this.atkHitBoxesRight.addBox(this.currentX_px, 5, this.currentY_px, - 20, 60, 20); // swordbox top on right
    this.atkHitBoxesRight.addBox(this.currentX_px, 40, this.currentY_px, 0, 47, 50); // swordbox right
    this.atkHitBoxesLeft = new SwordHitBox(-1, -0.6);
    this.atkHitBoxesLeft.addBox(this.currentX_px, - 30, this.currentY_px, -20, 60, 20); // swordbox top of left
    this.atkHitBoxesLeft.addBox(this.currentX_px, - 45, this.currentY_px, 0, 47, 50); // swordbox left

    this.health = GAME_CONSTANT.MAX_HEALTH;

    this.injureTime = GAME_CONSTANT.INJURE_TIME;

    //setting up gamestate bools
    this.removeFromWorld = false;
    this.controllable = true;
    // this.moveable = true;
    this.isRight = true;
    this.isAttacking = false;
    this.isInjure = false;

    var KnightAttackRight = new Animation(AM.getAsset("./img/knight/knight attack.png"), 90, 70, 0.085, false, 0, -20);
    KnightAttackRight.addFrame(0, 0, 8);
    var KnightAttackLeft = new Animation(AM.getAsset("./img/knight/knight attack flipped.png"), 90, 70, 0.085, false, -49, -20);
    KnightAttackLeft.addFrame(0, 0, 8);

    // var KnightHitRight = new Animation(AM.getAsset("./img/knight/knight hit draft.png"), 48, 50, 0.10, true);
    // KnightHitRight.addFrame(0, 0);
    // var KnightHitLeft = new Animation(AM.getAsset("./img/knight/knight hit draft flipped.png"), 48, 50, 0.10, true);
    // KnightHitLeft.addFrame(0, 0);

    var KnightStandingRight = new Animation(AM.getAsset("./img/knight/knight standing.png"), 41, 50, 0.1, true);
    KnightStandingRight.addFrame(0, 0);
    var KnightStandingLeft = new Animation(AM.getAsset("./img/knight/knight standing flipped.png"), 41, 50, 0.1, true);
    KnightStandingLeft.addFrame(0, 0);

    var KnightRunningRight = new Animation(AM.getAsset("./img/knight/knight run.png"), 49, 52, 0.1, true);
    KnightRunningRight.addFrame(0, 0, 8);
    var KnightRunningLeft = new Animation(AM.getAsset("./img/knight/knight run flipped.png"), 49, 52, 0.1, true);
    KnightRunningLeft.addFrame(0, 0, 8);

    var KnightJumpRight = new Animation(AM.getAsset("./img/knight/knight jump.png"), 47, 55, 0.1, true);
    KnightJumpRight.addFrame(0, 0);
    var KnightJumpLeft = new Animation(AM.getAsset("./img/knight/knight jump flipped.png"), 47, 55, 0.1, true);
    KnightJumpLeft.addFrame(0, 0);

    var KnightFallRight = new Animation(AM.getAsset("./img/knight/knight jump.png"), 47, 55, 0.1, true);
    KnightFallRight.addFrame(47, 0);
    var KnightFallLeft = new Animation(AM.getAsset("./img/knight/knight jump flipped.png"), 47, 55, 0.1, true);
    KnightFallLeft.addFrame(47, 0);

    this.animationList.push(KnightStandingRight);
    this.animationList.push(KnightStandingLeft);
    this.animationList.push(KnightRunningRight);
    this.animationList.push(KnightRunningLeft);
    this.animationList.push(KnightJumpRight);
    this.animationList.push(KnightJumpLeft);
    this.animationList.push(KnightFallRight);
    this.animationList.push(KnightFallLeft);
    this.animationList.push(KnightAttackRight);
    this.animationList.push(KnightAttackLeft);
    // this.animationList.push(KnightHitRight);
    // this.animationList.push(KnightHitLeft);
}

Knight.prototype = {
    moveX : function () {
        if (this.controllable) {
            if (this.game.keyStatus["d"])  {
                this.isRight = true;
                this.xVelocity = GAME_CONSTANT.RUNNING_SPEED;
                this.currentAnimation = GAME_CONSTANT.RUNNING_RIGHT_ANIMATION;
            } else if (this.game.keyStatus["a"]) {
                this.isRight = false;
                this.xVelocity = -GAME_CONSTANT.RUNNING_SPEED;
                this.currentAnimation = GAME_CONSTANT.RUNNING_LEFT_ANIMATION;
            } else if (!this.game.keyStatus["d"] && !this.game.keyStatus["a"]) {
                this.xVelocity = 0;
                if (this.isRight) {
                    this.currentAnimation = GAME_CONSTANT.STANDING_RIGHT_ANIMATION;
                } else {
                    this.currentAnimation = GAME_CONSTANT.STANDING_LEFT_ANIMATION;
                }
            }
            var newX = this.currentX_px + this.xVelocity;
            var obstacle = this.level.obstacleAt(newX, this.currentY_px, this.width, this.height);
            if (!obstacle) {
                this.currentX_px = newX;
            } // else if (obstacle instanceof Door) {
            //     this.level.displayHidden(this.currentX_px, this.currentY_px, obstacle);
            //     this.currentX_px = newX;
            // }
        }
    },

    moveY : function () {
        if (this.controllable) {
            if (this.yVelocity < GAME_CONSTANT.TERMINAL_VELOCITY) {
                this.yVelocity += GAME_CONSTANT.Y_ACCELERATION;
            }
            var newY = this.currentY_px + this.yVelocity;
            var obstacle = this.level.obstacleAt(this.currentX_px, newY, this.width, this.height);
            if (!obstacle) {
                this.currentY_px = newY;
            } else {
                if (this.game.keyStatus["w"] && this.yVelocity === GAME_CONSTANT.Y_ACCELERATION) {
                    this.yVelocity = -GAME_CONSTANT.JUMP_SPEED;
                } else {
                    this.yVelocity = 0;
                    if (this.currentY_px < obstacle.currentY_px) {
                        this.currentY_px = obstacle.currentY_px - this.height - 0.1;
                    }
                }
            }
            if (this.yVelocity !== 0) {
                if (this.yVelocity > 0) {
                    if (this.isRight) {
                        this.currentAnimation = GAME_CONSTANT.FALLING_RIGHT_ANIMATION;
                    } else {
                        this.currentAnimation = GAME_CONSTANT.FALLING_LEFT_ANIMATION;
                    }
                } else if (this.yVelocity < 0) {
                    if (this.isRight) {
                        this.currentAnimation = GAME_CONSTANT.JUMPING_RIGHT_ANIMATION;
                    } else {
                        this.currentAnimation = GAME_CONSTANT.JUMPING_LEFT_ANIMATION;
                    }
                }
            }
        }
    },

    touchEnemy : function (monster) {
        if (monster instanceof HealingStuff) {
            if (this.health < GAME_CONSTANT.MAX_HEALTH) {
                monster.removeFromWorld = true;
                this.health += monster.health;
            }
            if (this.health >= GAME_CONSTANT.MAX_HEALTH) {
                this.health = GAME_CONSTANT.MAX_HEALTH;
            }
        } else if (monster instanceof Arrow) {
            monster.removeFromWorld = true;
            this.health -= 1;
        } else {
            if (this.health > 0 && !this.isInjure && !monster.isBeingAttacked) {
                this.health -= GAME_CONSTANT.DAMAGE;
                this.isInjure = true;
                // TODO make some effects when the knight touches the monster.
            }

        }
    },

    update : function (tick) {
        this.moveX();
        this.moveY();
        if (this.game.keyStatus['space'] && this.yVelocity === 0) {
            this.controllable = false;
            this.isAttacking = true;
            if (this.isRight) {
                this.currentAnimation = GAME_CONSTANT.ATTACKING_RIGHT_ANIMATION;
            } else {
                this.currentAnimation = GAME_CONSTANT.ATTACKING_LEFT_ANIMATION;
            }
        }
        if (this.isAttacking) {
            if (this.animationList[this.currentAnimation].currentFrame() >= 1 &&
            this.animationList[this.currentAnimation].currentFrame() <= 4) {
                if (this.isRight) {
                    this.atkHitBoxesRight.hit(this.level.enemies);
                } else {
                    this.atkHitBoxesLeft.hit(this.level.enemies);
                }
            }
        }
        if (this.animationList[GAME_CONSTANT.ATTACKING_RIGHT_ANIMATION].isDone() ||
            this.animationList[GAME_CONSTANT.ATTACKING_LEFT_ANIMATION].isDone()) {
            this.animationList[GAME_CONSTANT.ATTACKING_RIGHT_ANIMATION].elapsedTime = 0;
            this.animationList[GAME_CONSTANT.ATTACKING_LEFT_ANIMATION].elapsedTime = 0;
            this.controllable = true;
            this.isAttacking = false;
        }
        var monster = this.level.enemyAt(this);
        if (monster) {
            this.touchEnemy(monster);
        }
        if (this.isInjure) {
            this.injureTime -= tick;
        }
        if (this.injureTime <= 0) {
            this.injureTime = GAME_CONSTANT.INJURE_TIME;
            this.isInjure = false;
        }

        if (this.health <= 0) {
            // TODO reset a map or go back to the check point
            this.currentX_px = this.checkPointX;
            this.currentY_px = this.checkPointY;
            this.health = GAME_CONSTANT.MAX_HEALTH;
        }
        this.atkHitBoxesRight.update(this.currentX_px, this.currentY_px);
        this.atkHitBoxesLeft.update(this.currentX_px, this.currentY_px);
        Entity.prototype.update.call(this);
    },

    drawRoundedRect : function (ctx, x, y, w, h) {
        var r = 10;
        ctx.beginPath();
        ctx.moveTo(x+r, y);
        ctx.lineTo(x+w-r, y);
        ctx.quadraticCurveTo(x+w, y, x+w, y+r);
        ctx.lineTo(x+w, y+h-r);
        ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
        ctx.lineTo(x+r, y+h);
        ctx.quadraticCurveTo(x, y+h, x, y+h-r);
        ctx.lineTo(x, y+r);
        ctx.quadraticCurveTo(x, y, x+r, y);
        ctx.fill();
    },

    draw : function (ctx, cameraRect, tick) {
        // console.log(cameraRect.left + " " + cameraRect.top + " " + this.currentX_px + " " + this.currentY_px);
        Entity.prototype.draw.call(this, ctx, cameraRect, tick);
        if (this.isAttacking) {
            if (this.isRight) {
                this.atkHitBoxesRight.draw(ctx, cameraRect);
            } else {
                this.atkHitBoxesLeft.draw(ctx,cameraRect);
            }
        }
        var percent = this.health / GAME_CONSTANT.MAX_HEALTH;
        ctx.fillStyle = "#8B3E31";
        this.drawRoundedRect(ctx, 10, 10, 520, 50);
        ctx.fillStyle = "black";
        this.drawRoundedRect(ctx, 20, 20, 500, 30);
        if (percent > 0.4) {
            ctx.fillStyle = "green";
        } else {
            ctx.fillStyle = "red";
        }
        this.drawRoundedRect(ctx, 20, 20, 500 * percent, 30);
    }
};

function SwordHitBox (knockbackX, knowbackY) {
    this.hitBoxes = [];
    this.knockback = {x : knockbackX, y : knowbackY}
}

SwordHitBox.prototype = {
    addBox : function (x, offX, y, offY, width, height) {
        this.hitBoxes.push({
            hitBox : new Rectangle(x + offX, y + offY, width, height),
            offsetX : offX,
            offsetY : offY
        });
    },

    hit : function (enemies) {
        var hitEnemies = []
        for (var i = 0; i < enemies.length; i += 1) {
            var monster = enemies[i];
            for (var j = 0; j < this.hitBoxes.length; j += 1) {
                var box = this.hitBoxes[j].hitBox;
                if (box.left + box.width > monster.currentX_px &&
                    box.left < monster.currentX_px + monster.width &&
                    box.top + box.height > monster.currentY_px &&
                    box.top < monster.currentY_px + monster.height) {
                        hitEnemies.push(monster);
                        break;
                    }
            }
        }
        for (var i = 0; i < hitEnemies.length; i += 1) {
            hitEnemies[i].gotAttacked(0, this.knockback);
        }
    },

    update : function (posX, posY) {
        for (var i = 0; i < this.hitBoxes.length; i += 1) {
            this.hitBoxes[i].hitBox.left = posX + this.hitBoxes[i].offsetX;
            this.hitBoxes[i].hitBox.top = posY + this.hitBoxes[i].offsetY;
        }
    },

    draw : function (ctx, cameraRect) {
        ctx.save();
        ctx.fillStyle = "red";
        ctx.globalAlpha = 0.5;
        for (var i = 0; i < this.hitBoxes.length; i += 1) {
            ctx.fillRect (this.hitBoxes[i].hitBox.left - cameraRect.left,
                this.hitBoxes[i].hitBox.top - cameraRect.top,
                this.hitBoxes[i].hitBox.width, this.hitBoxes[i].hitBox.height);
        }
        ctx.restore();
    }
}
