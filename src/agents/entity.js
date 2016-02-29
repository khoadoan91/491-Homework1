var GAME_CONSTANT = {
    BLOCK_SIZE : 50,

    DAMAGE : 2,
    INVULNERABLE_TIME : 0.50,

    //Physics Constants
    TERMINAL_VELOCITY : 16,
    //Gravity's downward acceleration
    Y_ACCELERATION : 0.35,
}

/**
 * An Entity is the physical object representation of player, monsters, boss.
 * The entity contains the object's x and y coordinates, animations,
 * and handles drawing of animation frames.
 */
function Entity(x, y, width, height) {
    this.animationList = [];
    this.currentAnimation = 0;

    this.currentX_px = x * GAME_CONSTANT.BLOCK_SIZE;
    this.currentY_px = y * GAME_CONSTANT.BLOCK_SIZE;
    this.width = width;
    this.height = height;
    this.isColidable = true;

    // Every entity represents as an rectangle.
    this.rect = new Rectangle(this.currentX_px, this.currentY_px, this.width, this.height);
}

Entity.prototype = {
    update : function () {
        this.rect.set(this.currentX_px, this.currentY_px);
    },
    /*
     * Request the entity to draw the current animation frame.
     */
    draw : function (ctx, cameraRect, tick) {
        if (this.animationList.length > 0 && (this.rect.overlap(cameraRect) || this.rect.within(cameraRect))) {
            this.animationList[this.currentAnimation].drawFrame(tick,
                                ctx, this.currentX_px - cameraRect.left, this.currentY_px - cameraRect.top);
        }
    }
}
