function Block (x, y, blockAnimation) {
   this.x = x;  // coordinate of the block of the map
   this.y = y;  // coordinate of the block of the map
   Entity.call(this, x, y, GAME_CONSTANT.BLOCK_SIZE, GAME_CONSTANT.BLOCK_SIZE);

   this.animationList.push(blockAnimation);
}

Block.prototype = new Entity();
Block.prototype.constructor = Block;

function Door (x, y, wallBlock) {
    Block.call(this, x, y, wallBlock);
    this.bossArea = null;
}

Door.prototype = {
    setBossArea : function (bossArea) {
        this.bossArea = bossArea;
    },

    update : function (tick, posX, posY, width, height) {
        if (!this.bossArea.boss.isAlive) {
            this.isColidable = false;
        } else {
            this.isColidable = true;
        }
    },

    draw : function (ctx, cameraRect, tick) {
        if (this.isColidable) {
            Block.prototype.draw.call(this, ctx, cameraRect, tick);
        }
    }
};

function InvisibleBlock (x, y, wallBlock) {
    Block.call(this, x, y, wallBlock);
    this.isColidable = false;
    this.bossArea = null;
}

InvisibleBlock.prototype = {
    setBossArea : function (bossArea) {
        this.bossArea = bossArea;
    },

    update : function (tick, posX, posY, width, height) {
        if (this.bossArea && posX > this.bossArea.currentX_px &&
                posY > this.bossArea.currentY_px) {
            this.isColidable = true;
        } else if (this.bossArea.isReset) {
            this.isColidable = false;
        }
    },

    draw : function (ctx, cameraRect, tick) {
        if (this.isColidable) {
            Block.prototype.draw.call(this, ctx, cameraRect, tick);
        }
    }
};

function VictoryBlock (x, y, level) {
    Entity.call(this, x, y, GAME_CONSTANT.BLOCK_SIZE, GAME_CONSTANT.BLOCK_SIZE);
    this.level = level;
    this.isColidable = false;
};

VictoryBlock.prototype = {
    update : function () {
        var actor = this.level.enemyAt(this);
        if (actor[0] instanceof Knight) {
            this.level.isWin = true;
            this.level.switchAndPlayMusic(BGM.victoryFanfare);
        }
    },

    draw : function (ctx, cameraRect, tick) {
        if (this.rect.overlap(cameraRect) || this.rect.within(cameraRect)) {
            ctx.fillStyle = "Red";
            ctx.fillRect(this.currentX_px + 5 - cameraRect.left, this.currentY_px + 5- cameraRect.top,
                        30, 30);
        }
    }
}
