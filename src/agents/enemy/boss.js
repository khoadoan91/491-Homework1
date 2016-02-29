var BOSS_ATTR = {
    NORMAL : 0,
    HIT : 1,
    ATK : 2,

    STARTING_HEALTH : 2,
    WAITING_TIME : 2,
    NORMAL_SPEED : 150,
    ATK_SPEED : {
        0 : 200,
        1 : 250,
        2 : 225,
        3 : 275
    }
};

function BossArea(x, y, width, height, bg, game, level) {
    Entity.call(this, x, y, width, height);
    this.bossImg = [];
    this.bossImg.push(AM.getAsset("./img/enemy/forest boss/forest boss statue base.png"));
    this.bossImg.push(AM.getAsset("./img/enemy/forest boss/forest boss statue chest.png"));
    this.bossImg.push(AM.getAsset("./img/enemy/forest boss/forest boss statue arm2.png"));
    this.bossImg.push(AM.getAsset("./img/enemy/forest boss/forest boss statue arm1.png"));
    this.bg = bg;
    this.isReset = true;
    this.game = game;
    this.level = level;
    this.isTrigger = false;
    this.delayTime = 2;
    this.boss = new Boss(x, y, width, height, level);
    this.transparent = 1;
}

BossArea.prototype = {
    reset : function () {
        this.bossImg = [];
        this.bossImg.push(AM.getAsset("./img/enemy/forest boss/forest boss statue base.png"));
        this.bossImg.push(AM.getAsset("./img/enemy/forest boss/forest boss statue chest.png"));
        this.bossImg.push(AM.getAsset("./img/enemy/forest boss/forest boss statue arm2.png"));
        this.bossImg.push(AM.getAsset("./img/enemy/forest boss/forest boss statue arm1.png"));
        this.isTrigger = false;
        this.delayTime = 2;
        this.boss.health = BOSS_ATTR.STARTING_HEALTH;
        this.boss.timeWait = BOSS_ATTR.WAITING_TIME;
        this.boss.status = BOSS_ATTR.NORMAL;
        this.boss.isAtk = false;
        this.boss.isInjure = false;
        this.boss.isAlive = true;
        this.boss.armType = ARM_ATTR.THIN;
        this.isReset = true;
        this.boss.animationList = [];
        while (!this.boss.isHidden()) {
            this.boss.update(this.game.clockTick);
        };
    },

    triggerCamera : function () {
        this.level.switchAndPlayMusic(BGM.forestBoss);
        this.game.camera.setDestination(this.currentX_px - 80, this.currentY_px, 5, 5);
        this.isReset = false;   // this flag is for the InvisibleBlock
        // this.bg.isTrigger = true;
    },

    update : function (tick, posX, posY, width, height) {
        if (!this.isTrigger && posX > this.currentX_px && posY > this.currentY_px) {
            this.triggerCamera();
            this.isTrigger = true;
        }
        if (this.isTrigger) {
            if (this.delayTime < 0) {
                this.boss.update(tick, posX, posY, width, height);
            } else {
                this.delayTime -= tick;
            }
        }
        if (!this.boss.isAlive && this.boss.isHidden()) {
            this.level.resetCamera();
            this.level.switchAndPlayMusic(BGM.forestLevel);
            this.isTrigger = false; // this flag for drawing the boss.
        }
        if ((this.boss.health === 10 && this.bossImg.length === 4) ||
            (this.boss.health === 6 && this.bossImg.length === 3) ||
            (this.boss.health === 0 && this.bossImg.length === 2)) {
            this.bossImg.splice(this.bossImg.length - 1, 1);
        }
    },

    draw : function (ctx, cameraRect, tick) {
        // draw boss background (always when it is alive)
        if (this.boss.isAlive) {
            ctx.drawImage(this.bg, this.currentX_px - cameraRect.left, this.currentY_px - cameraRect.top);
        }
        if (this.delayTime < 0) {
            if (this.boss.isMaxHeight()) {
                ctx.save();
                var flashing = Math.floor(this.boss.timeWait * 100);
                if (flashing % 5 === 0) {
                    ctx.globalAlpha = 0.1;
                }
                for (var i = this.bossImg.length - 1; i >= 0; i -= 1) {
                    ctx.drawImage(this.bossImg[i], this.currentX_px - cameraRect.left, this.currentY_px - cameraRect.top);
                }
                ctx.restore();
            } else if (!this.boss.isAlive) {
                for (var i = this.bossImg.length - 1; i >= 0; i -= 1) {
                    ctx.drawImage(this.bossImg[i], this.currentX_px - cameraRect.left, this.currentY_px - cameraRect.top);
                }
            }
            this.boss.draw(ctx, cameraRect, tick);
        } else {
            // when the knight is not in the boss area, draw an idle img.
            ctx.drawImage(AM.getAsset("./img/enemy/forest boss/forest boss statue idle.png"),
                    this.currentX_px - cameraRect.left, this.currentY_px - cameraRect.top);
        }
    }
};

function Boss (x, y, width, height, level) {
    Entity.call(this, x, y, width, height);
    this.timeWait = BOSS_ATTR.WAITING_TIME;
    this.status = BOSS_ATTR.NORMAL;
    this.isAtk = false;
    this.isInjure = false;
    this.isAlive = true;
    // this.normalSpeed = BOSS_ATTR.NORMAL_SPEED;
    // this.atkSpeed = BOSS_ATTR.ATK_SPEED;
    this.health = BOSS_ATTR.STARTING_HEALTH;
    this.armType = ARM_ATTR.THIN;

    var armThin = new Animation(AM.getAsset("./img/enemy/forest boss/forest boss spike 50px.png"), 50, 500, 1, true);
    armThin.addFrame(0, 0);
    var armNormal = new Animation(AM.getAsset("./img/enemy/forest boss/forest boss spike 100px.png"), 100, 500, 1, true);
    armNormal.addFrame(0, 0);
    var armWidth = new Animation(AM.getAsset("./img/enemy/forest boss/forest boss spike 150px.png"), 150, 500, 1, true);
    armWidth.addFrame(0, 0);
    var platform = new Animation(AM.getAsset("./img/enemy/forest boss/forest boss platform.png"), 150, 500, 1, true);
    platform.addFrame(0, 0);
    var core = new Animation(AM.getAsset("./img/enemy/forest boss/forest boss weak point.png"), 50, 50, 1, true);
    core.addFrame(0, 0);

    var distanceBetweenArms = 260;
    var base = this.currentY_px + this.height;
    this.core = new BossCore(this, base, core);
    level.characters.push(this.core);

    this.arms = [];
    for (var i = 0; i < 4; i += 1) {
        var arm = new BossArm(this.currentX_px + i * distanceBetweenArms + 185, base, BOSS_ATTR.NORMAL_SPEED, level);
        arm.addAnimation(platform);
        arm.addAnimation(armThin);
        arm.addAnimation(armNormal);
        arm.addAnimation(armWidth);
        this.arms.push(arm);
    }
    this.coreArm = 0;
}

Boss.prototype = {
    update : function (tick, posX, posY, width, height) {
        if (this.isAlive) {
            if (this.isHidden()) {
                // decide what to do next from the ground.
                if (this.status === BOSS_ATTR.HIT) {    // if the boss was hit, switch to atk mode
                    this.status = BOSS_ATTR.ATK;
                    this.setSpeed();
                } else if (this.status === BOSS_ATTR.ATK) { // if the boss did atk, switch to normal mode
                    this.status = BOSS_ATTR.NORMAL;
                }
                this.setSpeed();
                this.setArmsBasedOnStatus();
                this.setArmsState(ARM_ATTR.RISING);
            }
            if (this.isMaxHeight()) {
                if (this.status === BOSS_ATTR.HIT || this.status === BOSS_ATTR.ATK) {
                    this.setArmsState(ARM_ATTR.FALLING);
                    this.setSpeed();
                } else if (this.status === BOSS_ATTR.NORMAL) {
                    this.timeWait -= tick;
                    this.setArmsState(ARM_ATTR.REST);
                    if (this.timeWait <= 0) {
                        this.timeWait = BOSS_ATTR.WAITING_TIME;
                        this.setArmsState(ARM_ATTR.FALLING);
                    }
                }
            }
            for (var i = 0; i < this.arms.length; i += 1) {
                this.arms[i].update(tick);
            }
        } else {
            // TODO destroy all the arms
            this.setArmsState(ARM_ATTR.FALLING);

        }
        for (var i = 0; i < this.arms.length; i += 1) {
            this.arms[i].update(tick);
        }
        var percent = this.health / BOSS_ATTR.STARTING_HEALTH;
        if (percent < 0.75) {
            this.armType = ARM_ATTR.NORMAL;
        } else if (percent < 0.25) {
            this.armType = ARM_ATTR.WIDTH;
        }
        if (this.health <= 0) {
            this.isAlive = false;
        }
    },

    setSpeed : function () {
        if (this.status === BOSS_ATTR.NORMAL) {
            for (var i = 0; i < this.arms.length; i += 1) {
                this.arms[i].yVel = BOSS_ATTR.NORMAL_SPEED * this.armType;
            }
        } else {
            for (var i = 0; i < this.arms.length; i += 1) {
                this.arms[i].yVel = BOSS_ATTR.ATK_SPEED[i] * this.armType;
            }
        }
    },

    setArmsState : function (state) {
        for (var i = 0; i < this.arms.length; i += 1) {
            this.arms[i].state = state;
        }
    },

    setSecondPlatform : function (loc) {
        this.arms[loc].setAnimation(ARM_ATTR.PLATFORM);
        this.arms[loc].maxHeight = this.currentY_px + this.height - 350;
    },

    setArmsBasedOnStatus : function () {
        for (var i = 0; i < this.arms.length; i += 1) {
            this.arms[i].setAnimation(this.armType);
            this.arms[i].maxHeight = this.currentY_px + this.height - 500;
        }

        if (this.status === BOSS_ATTR.NORMAL) {
            this.coreArm = Math.floor(Math.random() * 4);
            this.arms[this.coreArm].setAnimation(ARM_ATTR.PLATFORM);
            this.core.setCoreLocation(this.arms[this.coreArm].centerX);
            switch (this.coreArm) {
                case 0:
                    this.setSecondPlatform(1);
                    break;
                case 1:
                    if (Math.floor(Math.random() * 2) === 0) this.setSecondPlatform(0);
                    else this.setSecondPlatform(2);
                    break;
                case 2:
                    if (Math.floor(Math.random()) * 2 === 0) this.setSecondPlatform(1);
                    else this.setSecondPlatform(3);
                    break;
                case 3:
                    this.setSecondPlatform(2);
                    break;
            }
        }
    },

    isMaxHeight : function () {
        for (var i = 0; i < this.arms.length; i += 1) {
            if (this.arms[i].currentY_px > this.arms[i].maxHeight) return false;
        }
        return true;
    },

    isHidden : function () {
        for (var i = 0; i < this.arms.length; i += 1) {
            if (this.arms[i].currentY_px < this.arms[i].base) return false;
        }
        return true;
    },

    draw : function (ctx, cameraRect, tick) {
        for (var i = 0; i < this.arms.length; i += 1) {
            this.arms[i].draw(ctx, cameraRect, tick);
        }
        this.core.draw(ctx, cameraRect, tick);
        if (!this.isAlive && !this.isHidden()) {
            var left = Math.floor(Math.random() * this.width) + this.currentX_px;
            var top = Math.floor(Math.random() * this.height) + this.currentY_px;
            var s = Math.floor(Math.random() * 5);
            var dieAnimation = new Animation(AM.getAsset("./img/enemy/death anim.png"), 15, 15, 0.2, false);
            dieAnimation.addFrame(0, 0, 15);
            this.animationList.push({anim : dieAnimation, x : left, y: top, scale : s});
            for (var i = this.animationList.length - 1; i >= 0; i -= 1) {
                this.animationList[i].anim.drawFrame(tick, ctx,
                        this.animationList[i].x - cameraRect.left, this.animationList[i].y - cameraRect.top,
                        0, 0, this.animationList[i].scale);
                if (this.animationList[i].anim.isDone()) {
                    this.animationList.splice(i, 1);
                }
            }
        }
    }
}
