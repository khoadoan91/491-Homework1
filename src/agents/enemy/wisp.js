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
