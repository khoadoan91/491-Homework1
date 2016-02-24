function BossArea(x, y, width, height, bg, game, level) {
    Entity.call(this, x, y, width, height);
    this.bg = bg;
    this.game = game;
    this.level = level;
    this.isTrigger = false;


}

BossArea.prototype = {
    triggerCamera : function () {
        this.game.camera.setDestination(this.currentX_px, this.currentY_px, 1, 1);
        this.bg.isTrigger = true;
    },

    update : function (tick, posX, posY, width, height) {
        if (!this.isTrigger && posX > this.currentX_px && posY > this.currentY_px) {
            this.triggerCamera();
            this.isTrigger = true;
        }
    }
}
