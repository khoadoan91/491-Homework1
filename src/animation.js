/**
 * Create a new animation.
 * frameWidth: The width of each frame.
 * frameHeight: The height of each frame.
 * frameDuration: The length in time that each frame should last.
 * loop: Set to true if the animation should repeat once it is over.
 */
function Animation(spriteSheet, frameWidth, frameHeight, frameDuration, loop, offsetX, offsetY) {
    this.elapsedTime = 0;
    this.frames = [];
    this.loop = loop;
    this.spriteSheet = spriteSheet;
    this.frameWidth = frameWidth;
    this.frameHeight = frameHeight;
    this.frameDuration = frameDuration;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    if (this.offsetX === undefined) this.offsetX = 0;
    if (this.offsetY === undefined) this.offsetY = 0;
}

Animation.prototype = {
    /**
<<<<<<< HEAD
     * Add several frames in a series to the animation 
=======
     * Add several frames in a series to the animation
>>>>>>> e83c13b82c813d30842fe023010ac2a27b4e9e25
     * (will scan forward or backward - Default is forward).
     * Will automatically skip to the next row if it reaches the end or the start of a column.
     */
    addFrame : function (startX, startY, numFrames, scanForward) {
        var currentX = startX;
        var currentY = startY;
        var frames = numFrames || 1;
        //Scan through the spritesheet, adding frames at each index as we go.
        for (var i = 0; i < frames; i += 1) {
            if (scanForward === false) {    // scan backward
                if (currentX < 0) {
                    currentX = this.spriteSheet.width - this.frameWidth;
                    currentY -= this.frameHeight;
                }
                this.frames.push([currentX, currentY]);
                currentX -= this.frameWidth;
            } else {    // scan forward
                if(currentX + this.frameWidth > this.spriteSheet.width) {
                    currentX = 0;
                    currentY += this.frameHeight;
                }
                this.frames.push([currentX, currentY]);
                currentX += this.frameWidth;
            }
        }
    },

    drawFrame : function (tick, ctx, x, y, width, height, scale) {
        var s = scale || 1;
        var w = width || this.frameWidth;
        var h = height || this.frameHeight;
        this.elapsedTime += tick;
        if (this.isDone()) {
            if (this.loop) {
                this.elapsedTime = 0;
            }
        }
        var curFrame = this.currentFrame();
        var xStart = this.frames[curFrame][0];
        var yStart = this.frames[curFrame][1];
        ctx.drawImage(this.spriteSheet,
                      xStart, yStart,
                      w, h,
                      x + this.offsetX, y + this.offsetY,
                      w * s, h * s);
    },

    isDone : function () {
        return this.currentFrame() + 1 >= this.frames.length;
    },

    currentFrame : function () {
        return Math.floor(this.elapsedTime / this.frameDuration);
    }
}
