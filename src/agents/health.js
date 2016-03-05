function HealingStuff (x, y) {
    Entity.call(this, x, y, 30, 30);

    this.health = 8;
    this.removeFromWorld = false;
}

HealingStuff.prototype = new Entity();
HealingStuff.prototype.constructor = HealingStuff;

HealingStuff.prototype.reset = function () {
    this.removeFromWorld = false;
}

HealingStuff.prototype.draw = function(ctx, cameraRect, tick) {
    if (this.rect.overlap(cameraRect) || this.rect.within(cameraRect)) {
        ctx.fillStyle = "Yellow";
        ctx.fillRect(this.currentX_px + 5 - cameraRect.left, this.currentY_px + 5- cameraRect.top,
                        30, 30);
    }
}
