var KNIGHT_ATTR = {
    MAX_HEALTH : 10,
    INJURE_TIME : 2,

    RUNNING_SPEED : 5,
    //Initial jump velocity for tapping jump.
    JUMP_SPEED : -12,

    //Animation Constants
    STANDING_RIGHT_ANIMATION : 0,
    STANDING_LEFT_ANIMATION : 1,
    RUNNING_RIGHT_ANIMATION : 2,
    RUNNING_LEFT_ANIMATION : 3,
    JUMPING_RIGHT_ANIMATION : 4,
    JUMPING_LEFT_ANIMATION : 5,
    FALLING_RIGHT_ANIMATION : 6,
    FALLING_LEFT_ANIMATION : 7,
    ATTACKING_RIGHT_ANIMATION : 8,
    ATTACKING_LEFT_ANIMATION : 9,
}

function Knight (x, y, game, level) {
    Entity.call(this, x, y, 41, 50);
    this.level = level;
    this.game = game;
    this.lives = 1;
    this.xVelocity = 0;
    this.yVelocity = 0;
    this.checkpointX = this.currentX_px;
    this.checkpointY = this.currentY_px;
    this.atkHitBoxesRight = new SwordHitBox(1, -0.6);
    this.atkHitBoxesRight.addBox(this.currentX_px, 5, this.currentY_px, - 20, 60, 20); // swordbox top on right
    this.atkHitBoxesRight.addBox(this.currentX_px, 40, this.currentY_px, 0, 47, 50); // swordbox right
    this.atkHitBoxesLeft = new SwordHitBox(-1, -0.6);
    this.atkHitBoxesLeft.addBox(this.currentX_px, - 30, this.currentY_px, -20, 60, 20); // swordbox top of left
    this.atkHitBoxesLeft.addBox(this.currentX_px, - 45, this.currentY_px, 0, 47, 50); // swordbox left

    this.health = KNIGHT_ATTR.MAX_HEALTH;
    this.injureTime = KNIGHT_ATTR.INJURE_TIME;

    //setting up gamestate bools
    this.showSwordHitBox = false;
    this.isAlive = true;
    this.removeFromWorld = false;
    this.controllable = true;
    this.isOnTheAir = false;
    this.isFalling = false;
    this.isRight = true;
    this.isAttacking = false;
    this.isInjure = false;

    var KnightAttackRight = new Animation(AM.getAsset("./img/knight/knight attack.png"), 90, 70, 0.085, false, 0, -20);
    KnightAttackRight.addFrame(0, 0, 8);
    var KnightAttackLeft = new Animation(AM.getAsset("./img/knight/knight attack flipped.png"), 90, 70, 0.085, false, -49, -20);
    KnightAttackLeft.addFrame(0, 0, 8);

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
    var KnightJumpLeft = new Animation(AM.getAsset("./img/knight/knight jump draft flipped.png"), 47, 55, 0.10, true);
    KnightJumpLeft.addFrame(47, 0);
    
    var KnightFallRight = new Animation(AM.getAsset("./img/knight/knight jump draft.png"), 47, 55, 0.10, true);
    KnightFallRight.addFrame(47, 0);
    var KnightFallLeft = new Animation(AM.getAsset("./img/knight/knight jump draft flipped.png"), 47, 55, 0.10, true);
    KnightFallLeft.addFrame(0, 0);
    
    this.animationList.push(KnightRestRight);
    this.animationList.push(KnightRestLeft);
    this.animationList.push(KnightWalkRight);
    this.animationList.push(KnightWalkLeft);
    this.animationList.push(KnightJumpRight);
    this.animationList.push(KnightJumpLeft);
    this.animationList.push(KnightFallRight);
    this.animationList.push(KnightFallLeft);
    this.animationList.push(KnightAttackRight);
    this.animationList.push(KnightAttackLeft);
}

Knight.prototype = {
    reset : function () {
        this.currentX_px = this.checkpointX;
        this.currentY_px = this.checkpointY;
        this.lives = 2;
        this.currentAnimation = KNIGHT_ATTR.STANDING_RIGHT_ANIMATION;
        this.removeFromWorld = false;
        this.isAlive = true;
        this.health = KNIGHT_ATTR.MAX_HEALTH;
    },

    moveX : function () {
        if (this.controllable) {
            if (this.game.keyStatus["d"])  {
                this.isRight = true;
                this.xVelocity = KNIGHT_ATTR.RUNNING_SPEED;
                this.currentAnimation = KNIGHT_ATTR.RUNNING_RIGHT_ANIMATION;
            } else if (this.game.keyStatus["a"]) {
                this.isRight = false;
                this.xVelocity = -KNIGHT_ATTR.RUNNING_SPEED;
                this.currentAnimation = KNIGHT_ATTR.RUNNING_LEFT_ANIMATION;
            } else if (!this.game.keyStatus["d"] && !this.game.keyStatus["a"]) {
                this.xVelocity = 0;
                if (this.isRight) {
                    this.currentAnimation = KNIGHT_ATTR.STANDING_RIGHT_ANIMATION;
                } else {
                    this.currentAnimation = KNIGHT_ATTR.STANDING_LEFT_ANIMATION;
                }
            }
            var newX = this.currentX_px + this.xVelocity;
            var obstacle = this.level.obstacleAt(newX, this.currentY_px, this.width, this.height);
            if (!obstacle) {
                this.currentX_px = Math.floor(newX);
            } // else if (obstacle instanceof Door) {
            //     this.level.displayHidden(this.currentX_px, this.currentY_px, obstacle);
            //     this.currentX_px = newX;
            // }
        }
    },
    
    moveY : function () {
        // if (this.controllable || this.isAttacking) {
            if (this.yVelocity < GAME_CONSTANT.TERMINAL_VELOCITY) {
                this.yVelocity += GAME_CONSTANT.Y_ACCELERATION;
            }
            var newY = this.currentY_px + this.yVelocity;
            var obstacle = this.level.obstacleAt(this.currentX_px, newY, this.width, this.height);
            if (!obstacle) {
                this.currentY_px = Math.floor(newY);
            } else {
                if (this.game.keyStatus["w"] && this.yVelocity === GAME_CONSTANT.Y_ACCELERATION) {
                    this.yVelocity = KNIGHT_ATTR.JUMP_SPEED;
                } else {
                    this.yVelocity = 0;
                    this.isOnTheAir = false;
                    if (this.currentY_px < obstacle.currentY_px) {
                        this.currentY_px = obstacle.currentY_px - this.height - 0.1; 
                    }    
                }
            }
            if (this.yVelocity !== 0 && !this.isAttacking) {
                if (this.yVelocity > 0) {
                    if (this.isRight) {
                        this.currentAnimation = KNIGHT_ATTR.FALLING_RIGHT_ANIMATION;
                    } else {
                        this.currentAnimation = KNIGHT_ATTR.FALLING_LEFT_ANIMATION;
                    }
                } else if (this.yVelocity < 0) { 
                    if (this.isRight) {
                        this.currentAnimation = KNIGHT_ATTR.JUMPING_RIGHT_ANIMATION;
                    } else {
                        this.currentAnimation = KNIGHT_ATTR.JUMPING_LEFT_ANIMATION;
                    }
                }
            }
        // }
    },

    touchEnemy : function (monster) {
        if (monster[0] instanceof HealingStuff) {
            if (this.health < KNIGHT_ATTR.MAX_HEALTH) {
                monster[0].removeFromWorld = true;
                this.health += monster[0].health;
            }
            if (this.health >= KNIGHT_ATTR.MAX_HEALTH) {
                this.health = KNIGHT_ATTR.MAX_HEALTH;
            }
        } else if (monster[0] instanceof Arrow) {
            monster[0].removeFromWorld = true;
            if (this.health > 0 && !this.isInjure) {
                this.isInjure = true;
                this.health -= 1;
            }
        } else if (monster[0] instanceof BossCore) {
            // do nothing.
        } else {
            if (this.health > 0 && !this.isInjure &&
                !monster[0].isBeingAttacked && monster[0].isAlive) {
                this.health -= GAME_CONSTANT.DAMAGE;
                this.isInjure = true;
            }
        }
    },

    update : function (tick) {
        this.moveX();
        this.moveY();
        if (this.game.keyStatus['space']) {
            this.controllable = false;
            this.isAttacking = true;
            if (this.isRight) {
                this.currentAnimation = KNIGHT_ATTR.ATTACKING_RIGHT_ANIMATION;
            } else {
                this.currentAnimation = KNIGHT_ATTR.ATTACKING_LEFT_ANIMATION;
            }
        }
        if (this.isAttacking) {
            if (this.animationList[this.currentAnimation].currentFrame() >= 1 &&
            this.animationList[this.currentAnimation].currentFrame() <= 4) {
                if (this.isRight) {
                    this.atkHitBoxesRight.hit(this.level.characters);
                } else {
                    this.atkHitBoxesLeft.hit(this.level.characters);
                }
            }
        }
        if (this.animationList[KNIGHT_ATTR.ATTACKING_RIGHT_ANIMATION].isDone() ||
            this.animationList[KNIGHT_ATTR.ATTACKING_LEFT_ANIMATION].isDone()) {
            this.animationList[KNIGHT_ATTR.ATTACKING_RIGHT_ANIMATION].elapsedTime = 0;
            this.animationList[KNIGHT_ATTR.ATTACKING_LEFT_ANIMATION].elapsedTime = 0;
            this.controllable = true;
            this.isAttacking = false;
        }
        var monster = this.level.enemyAt(this);
        if (monster.length > 0) {
            this.touchEnemy(monster);
        }
        if (this.isInjure) {
            this.injureTime -= tick;
        }
        if (this.injureTime <= 0) {
            this.injureTime = KNIGHT_ATTR.INJURE_TIME;
            this.isInjure = false;
            this.knockback = {x : 0, y : 0};
        }

        if (this.health <= 0 && this.lives > 0) {
            this.level.resetBossArea();
            this.injureTime = KNIGHT_ATTR.INJURE_TIME;
            this.isInjure = false;
            this.currentX_px = this.checkpointX;
            this.currentY_px = this.checkpointY;
            this.health = KNIGHT_ATTR.MAX_HEALTH;
            this.lives -= 1;
        } else if (this.lives <= 0) {
            this.removeFromWorld = true;
            this.level.isGameOver = true;
            this.game.click = null;
            // this.lives = 2;
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
        ctx.save();
        var flashing = Math.floor(this.injureTime * 100);
        if (this.isInjure && (flashing % 5 === 0 || flashing % 2 === 0)) {
            ctx.globalAlpha = 0.1;
        }
        Entity.prototype.draw.call(this, ctx, cameraRect, tick);
        ctx.restore();
        if (this.showSwordHitBox && this.isAttacking) {
            if (this.isRight) {
                this.atkHitBoxesRight.draw(ctx, cameraRect);
            } else {
                this.atkHitBoxesLeft.draw(ctx,cameraRect);
            }
        }
        var percent = this.health / KNIGHT_ATTR.MAX_HEALTH;
        ctx.fillStyle = "#2C5D63";
        this.drawRoundedRect(ctx, 10, 10, 520, 50);
        ctx.fillStyle = "black";
        this.drawRoundedRect(ctx, 20, 20, 500, 30);
        if (percent > 0.4) {
            ctx.fillStyle = "#A9C52F";
        } else {
            ctx.fillStyle = "red";
        }
        this.drawRoundedRect(ctx, 20, 20, 500 * percent, 30);
        ctx.fillStyle = "#A9C52F";
        ctx.font = "25pt Impact";
        var lives = "Lives : " + this.lives;
        ctx.fillText(lives, 1100, 50);
        var time = "Total time: " + Math.floor(this.game.timer.gameTime);
        ctx.fillText(time, 700, 50);
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

    hit : function (characters) {
        var hitEnemies = []
        for (var i = 0; i < characters.length; i += 1) {
            var character = characters[i];
            if (character instanceof Knight || character instanceof HealingStuff) continue;
            for (var j = 0; j < this.hitBoxes.length; j += 1) {
                var box = this.hitBoxes[j].hitBox;
                if (box.left + box.width > character.currentX_px &&
                    box.left < character.currentX_px + character.width &&
                    box.top + box.height > character.currentY_px &&
                    box.top < character.currentY_px + character.height) {
                        hitEnemies.push(character);
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
