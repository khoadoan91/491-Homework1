var ARM_ATTR = {
    REST: 0,
    RISING : 1,
    FALLING : 2,

    PLATFORM : 0,
    THIN : 1,
    NORMAL: 2,
    WIDTH : 3,
};

function BossArm (x, y, yVel, level) {
    // center top of the arm.
    this.centerX = x;
    this.currentX_px = x - 75;
    this.width = 150;
    this.height = 500;
    this.level = level;
    this.currentY_px = y;
    this.state = ARM_ATTR.REST;

    this.base = y;
    this.maxHeight = y - 500;
    this.animationList = [];
    this.currentAnimation = ARM_ATTR.PLATFORM;
    this.yVel = yVel;
    this.core = null;
    // this.timeWait = BOSS_ATTR.WAITING_TIME;
    this.isWaiting = true;
}

BossArm.prototype = {

    addAnimation : function (animation) {
        this.animationList.push(animation);
    },

    setAnimation : function (anim) {
        this.currentAnimation = anim;
        switch (anim) {
            case ARM_ATTR.PLATFORM:
            case ARM_ATTR.WIDTH:
                this.width = 150;
                this.currentX_px = this.centerX - 75;
                break;
            case ARM_ATTR.THIN:
                this.width = 50;
                this.currentX_px = this.centerX - 25;
                break;
            case ARM_ATTR.NORMAL:
                this.width = 100;
                this.currentX_px = this.centerX - 50;
                break;
            default: break;
        }
    },

    update : function (tick, posX, posY, width, height) {
        var character = this.level.enemyAt(this);
        if (this.state === ARM_ATTR.RISING && this.currentY_px > this.maxHeight) {
            this.currentY_px -= tick * this.yVel;
        } else if (this.state === ARM_ATTR.FALLING && this.currentY_px < this.base) {
            this.currentY_px += tick * this.yVel;
        }
        if (this.currentAnimation === ARM_ATTR.PLATFORM && character.length > 0) {
            for (var i = 0; i < character.length; i += 1) {
                character[i].currentY_px = this.currentY_px - character[i].height - 0.1;
            }
        }
    },

    draw : function (ctx, cameraRect, tick) {
        if (this.currentY_px < this.base) {
            this.animationList[this.currentAnimation].drawFrame(tick,
                                ctx, this.currentX_px - cameraRect.left,
                                this.currentY_px - cameraRect.top,
                                0, this.base - this.currentY_px);
        }
    }
};

function BossCore (boss, base, animation) {
    this.boss = boss;
    this.currentY_px = base - 550;
    this.centerX_px = null;
    this.currentX_px = null;
    this.width = 50;
    this.height = 50;
    this.animation = animation;
}

BossCore.prototype = {
    gotAttacked : function () {
        var arm = this.boss.arms[this.boss.coreArm];
        if (arm.currentAnimation === ARM_ATTR.PLATFORM && arm.currentY_px <= arm.maxHeight) {
            this.boss.status = BOSS_ATTR.HIT;
            this.boss.health--;
        }
    },

    setCoreLocation : function (x) {
        this.centerX_px = x;
        this.currentX_px = x - 25;
    },

    update : function () {

    },

    draw : function (ctx, cameraRect, tick) {
        var arm = this.boss.arms[this.boss.coreArm];
        if (arm.currentAnimation === ARM_ATTR.PLATFORM && arm.currentY_px <= arm.maxHeight) {
            this.animation.drawFrame(tick, ctx, this.currentX_px - cameraRect.left,
                                    this.currentY_px - cameraRect.top);
        }
    }
}