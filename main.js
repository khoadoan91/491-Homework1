var AS = new AssetManager();

AS.queueDownload("Nitro.png");
AS.queueDownload("Nitro-Flip.png");

AS.downloadAll(function () {
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');

    var gameEngine = new GameEngine();
    var nitro = new Nitro(gameEngine);
    var bg = new BackGround(gameEngine);

    gameEngine.addEntity(nitro);
    gameEngine.addEntity(bg);

    gameEngine.init(ctx);
    gameEngine.start();
});

function BackGround(game) {
    this.game = game;
}

BackGround.prototype = {
    update : function() {},
    draw : function() {
        this.game.ctx.fillStyle = "SaddleBrown";
        this.game.ctx.fillRect (0, 0, 800, 110);
        this.game.ctx.fillRect (0, 585, 800, 215);
        this.game.ctx.fillRect (650, 385, 150, 450);
    }
}

function Nitro(game) {
    this.game = game;
    this.ground = 500;
    this.ceiling = 100;
    this.wallInLocX = 650 - 102;
    this.wallHeight = 385 - 85;  
    this.currentX = 0;
    this.currentY = 500;
    this.removeFromWorld = false;
    this.isOnGround = true;
    this.isLanding = false;
    this.animation = new Animation(AS.getAsset("Nitro.png"), 0, 0,
        AS.getAsset("Nitro-Flip.png"), 397, 0, 50, 44, 0.095, 8, false, true);
    this.flyAnimation = new Animation(AS.getAsset("Nitro.png"), 0, 44,
        AS.getAsset("Nitro-Flip.png"), 378, 44, 69, 53, 0.095, 5, false, true);
}

Nitro.prototype = {
    update : function() {
        // FIXME set to move forward when hit forward.
        if (this.game.keysDown) {
            this.animation.elapsedTime += this.game.clockTick;
            this.flyAnimation.elapsedTime += this.game.clockTick;
        }
        if (this.game.keyStatus['d']) {
            this.animation.flip = false;
            this.flyAnimation.flip = false;
            if (this.currentY <= this.wallHeight || this.currentX < this.wallInLocX) {
                if (this.currentX < 700) {  // 800 - 100
                    this.currentX += 4;
                }
            }
        } else if (this.game.keyStatus['a']) {
            this.animation.flip = true;
            this.flyAnimation.flip = true;
            if (this.currentX > 0) {
                this.currentX -= 4;
            }
        }
        if (this.game.keyStatus['w']) {
            this.isOnGround = false;
            this.isLanding = false;
            if (this.currentY > this.ceiling) {
                this.currentY -= 4;
            }
        } else if (!this.game.keyStatus['w']) {
            this.isLanding = true;
            if ((this.currentY < this.ground && this.currentX <= this.wallInLocX) || 
                (this.currentX > this.wallInLocX && this.currentY < this.wallHeight)) {
                this.currentY += 4;
            } else {
                this.isOnGround = true;
            }
        }
    },

    draw : function() {
        if (this.isOnGround) {
            this.animation.drawFrame(this.game.ctx, this.currentX, this.currentY, 2, false);
        } else {
            if (this.isLanding) {
                this.flyAnimation.drawFrame(this.game.ctx, this.currentX, this.currentY, 2, true)
            } else {
                this.flyAnimation.drawFrame(this.game.ctx, this.currentX, this.currentY, 2, false);
            }
        }
    }
}

function Animation(source1, startX_s1, startY_s1, source2, startX_s2, startY_s2, frameWidth, frameHeight, frameDuration, frames, flip, loop) {
    this.source1 = source1;
    this.startX_s1 = startX_s1;
    this.startY_s1 = startY_s1;
    this.source2 = source2;
    this.startX_s2 = startX_s2;
    this.startY_s2 = startY_s2;
    this.frameWidth = frameWidth;
    this.frameHeight = frameHeight;
    this.frames = frames;
    this.flip = flip;
    this.loop = loop;
    this.elapsedTime = 0;
    this.frameDuration = frameDuration;
    this.totalTime = frameDuration * frames;
}

Animation.prototype = {
    drawFrame : function (ctx, x, y, scaleBy, isLanding) {
        var scale = scaleBy || 1;
        if (this.loop) {
            if (this.isDone()) {
                this.elapsedTime = 0;
            }
        } else if (this.isDone()) {
            return;
        }

        var frameIndex = this.currentFrame();
        if (!this.flip) {
            if (isLanding) {
                ctx.drawImage (this.source1, 345, this.startY_s1,
                    55, this.frameHeight,
                    x, y, 55 * scale, this.frameHeight * scale);
            } else {
                ctx.drawImage(this.source1,
                    this.startX_s1 + (frameIndex * this.frameWidth),
                    this.startY_s1,
                    this.frameWidth, this.frameHeight,
                    x, y, this.frameWidth * scale, this.frameHeight * scale);
            }
        } else {
            if (isLanding) {
                ctx.drawImage (this.source2, 47, this.startY_s1,
                    55, this.frameHeight,
                    x, y, 55 * scale, this.frameHeight * scale);
            } else {
                ctx.drawImage(this.source2,
                    this.startX_s2 - (frameIndex * this.frameWidth),
                    this.startY_s2,
                    this.frameWidth, this.frameHeight,
                    x, y, this.frameWidth * scale, this.frameHeight * scale);
            }
        }
    },

    currentFrame : function () {
        return Math.floor(this.elapsedTime / this.frameDuration);
    },

    isDone : function () {
        return (this.elapsedTime >= this.totalTime);
    }
}
