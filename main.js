var AS = new AssetManager();

AS.queueDownload("Nitro.png");
AS.queueDownload("Nitro-Flip.png");

AS.downloadAll(function () {
     
    var canvas = document.getElementById('gameWorld'),
        ctx = canvas.getContext('2d'),

        gameEngine = new GameEngine(),
        nitro = new Nitro(gameEngine, 500, 500),
        bg = new BackGround();

//        room = new Map(canvas.width * 2, canvas.height),
//        camera = new Camera(0, 0, canvas.width, canvas.height, room.width, room.height);
    
//    room.generate(
//"--------------------------------\n\
//--------------------------------\n\
//                                \n\
//                                \n\
//                                \n\
//             -------------------\n\
//             -------------------\n\
//             -------------------\n\
//--------------------------------\n\
//--------------------------------\n\
//--------------------------------\n\
//--------------------------------\n", ctx);

//    camera.follow(nitro, canvas.width / 2, canvas.height / 2);

    gameEngine.addEntity(bg);
//    gameEngine.addEntity(camera);
//    gameEngine.addEntity(room);
    gameEngine.addEntity(nitro);

    gameEngine.init(ctx);
    gameEngine.start();
});

// Vector Constructor
function Vector(x, y) {
    this.x = y;
    this.y = y;
}

// Vector method
Vector.prototype = {
    plus : function (other) {
        return new Vector(this.x + other.x, this.y + other.y);
    },
    
    multiply : function (factor) {
        return new Vector(this.x * factor, this.y * factor);
    }
}

// Background Constructor
function BackGround() {
    this.game = game;
}

BackGround.prototype = {
    update : function () {  },
    draw : function (ctx) {
         
        ctx.fillStyle = "SaddleBrown";
        ctx.fillRect(0, 0, 800, 100);  // ceiling
        ctx.fillRect(0, 600, 800, 218); // ground
        ctx.fillRect(650, 402, 150, 250); // hill
    }
};

function Nitro(game, startX, startY) {
     
    this.game = game;
    this.currentX = startX; // center of the Nitro
    this.currentY = startY; // center of the Nitro 
    this.speed = 4;  // move speed in pixels per tick;
    this.landWidth = 50;    // width of the frame while on the ground
    this.landHeight = 42;   // height of the frame while on the ground
    this.flyWidth = 69;     // width of the frame while flying
    this.flyHeight = 48;    // height of the frame while flying
    // since the scale is 2, so no need to divide by 2.
    this.ground = 600 - this.landHeight;
    this.ceiling = 100 + this.flyHeight;

    this.hillLocX = 650 - this.landWidth;
    this.hillHeight = 402 - this.landHeight;

    this.boundaryLeft = this.landWidth;
    this.boundaryRight = /* canvas.width */ 800 - this.landWidth;

    this.removeFromWorld = false;
    // flag
    this.isOnGround = false;
    this.isLanding = false;
    this.animation = new Animation(AS.getAsset("Nitro.png"), 0, 0,
        AS.getAsset("Nitro-Flip.png"), 397, 0, this.landWidth, this.landHeight, 0.095, 8, false, true);
    this.flyAnimation = new Animation(AS.getAsset("Nitro.png"), 0, 47,
        AS.getAsset("Nitro-Flip.png"), 378, 47, this.flyWidth, this.flyHeight, 0.095, 5, false, true);
}

Nitro.prototype = {
    update : function () {
         
        if (this.game.keysDown) {
            this.animation.elapsedTime += this.game.clockTick;
            this.flyAnimation.elapsedTime += this.game.clockTick;
        }
        if (this.game.keyStatus.d) {
            this.animation.flip = false;
            this.flyAnimation.flip = false;
            if (this.currentY <= this.hillHeight || this.currentX < this.hillLocX) {
                if (this.currentX < this.boundaryRight) {
                    this.currentX += this.speed;
                }
            }
        } else if (this.game.keyStatus.a) {
            this.animation.flip = true;
            this.flyAnimation.flip = true;
            if (this.currentX > this.boundaryLeft) {
                this.currentX -= this.speed;
            }
        }
        if (this.game.keyStatus.w) {
            this.isOnGround = false;
            this.isLanding = false;
            if (this.currentY > this.ceiling) {
                this.currentY -= this.speed;
            }
        } else if (!this.game.keyStatus.w) {
            this.isLanding = true;
            if ((this.currentY < this.ground && this.currentX <= this.hillLocX) ||
                    (this.currentX > this.hillLocX && this.currentY < this.hillHeight)) {
                this.currentY += this.speed;
            } else {
                this.isOnGround = true;
            }
        }
    },

    draw : function () {
         
        if (this.isOnGround) {
            this.animation.drawFrame(this.game.ctx, this, 2, false);
        } else {
            if (this.isLanding) {
                this.flyAnimation.drawFrame(this.game.ctx, this, 2, true)
            } else {
                this.flyAnimation.drawFrame(this.game.ctx, this, 2, false);
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
    drawFrame : function (ctx, nitro, scaleBy, isLanding) {
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
                // console.log("Landing...");
                ctx.drawImage (this.source1, 345, this.startY_s1,
                    55, this.frameHeight,
                    nitro.currentX - Math.floor(nitro.flyWidth/2), 
                    nitro.currentY - Math.floor(nitro.flyHeight/2), 
                    55 * scale, this.frameHeight * scale);
            } else {
                // console.log("Walking...");
                ctx.drawImage(this.source1,
                    this.startX_s1 + (frameIndex * this.frameWidth),
                    this.startY_s1,
                    this.frameWidth, this.frameHeight,
                    nitro.currentX - Math.floor(nitro.landWidth/2) * scale, 
                    nitro.currentY - Math.floor(nitro.landHeight/2) * scale, 
                    this.frameWidth * scale, this.frameHeight * scale);
            }
        } else {
            if (isLanding) {
                ctx.drawImage (this.source2, 47, this.startY_s1,
                    55, this.frameHeight,
                    nitro.currentX - Math.floor(nitro.flyWidth/2) * scale, 
                    nitro.currentY - Math.floor(nitro.flyHeight/2) * scale, 
                    55 * scale, this.frameHeight * scale);
            } else {
                ctx.drawImage(this.source2,
                    this.startX_s2 - (frameIndex * this.frameWidth),
                    this.startY_s2,
                    this.frameWidth, this.frameHeight,
                    nitro.currentX - Math.floor(nitro.landWidth/2) * scale, 
                    nitro.currentY - Math.floor(nitro.landHeight/2) * scale, 
                    this.frameWidth * scale, this.frameHeight * scale);
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


function Rectangle (left, top, width, height) {
    this.left = left || 0;
    this.top = top || 0;
    this.width = width || 0;
    this.height = height || 0;
    this.right = this.left + this.width;
    this.bottom = this.top + this.height;
}

Rectangle.prototype = {
    set : function (left, top, /*optional*/ width, /*optional*/ height) {
        this.left = left;
        this.top = top;
        this.width = width || this.width;
        this.height = height || this.height;
        this.right = (this.left + this.width);
        this.bottom = (this.top + this.height);
    },

    within : function (r) {
        return (r.left <= this.left &&
            r.right >= this.right &&
            r.top <= this.top &&
            r.bottom >= this.bottom);
    },

    overlaps : function (r) {
        return (this.left < r.right &&
            r.left < this.right &&
            this.top < r.bottom &&
            r.top < this.bottom);
    }
}

var AXIS = {
    NONE : "none",
    HORIZONTAL: "horizontal",
    VERTICAL: "vertical",
    BOTH: "both"
}
function Camera (xView, yView, canvasWidth, canvasHeight, worldWidth, worldHeight) {
    // position of camera (left-top coordinate)
    this.xView = xView || 0;
    this.yView = yView || 0;

    // distance from followed object to border before camera starts move
    this.xDeadZone = 0; // min distance to horizontal borders
    this.yDeadZone = 0; // min distance to vertical borders
      
    // viewport dimensions
    this.wView = canvasWidth;
    this.hView = canvasHeight;      
      
    // allow camera to move in horizontal axis
    this.axis = AXIS.HORIZONTAL;  

    // object that should be followed
    this.followed = null;

    // rectangle that represents the viewport
    this.viewportRect = new Rectangle(this.xView, this.yView, this.wView, this.hView);

    // rectangle that represents the world's boundary (room's boundary)
    this.worldRect = new Rectangle(0, 0, worldWidth, worldHeight);
}

Camera.prototype = {
    // gameObject needs to have "x" and "y" properties (as world position)
    follow : function (gameObject, xDeadZone, yDeadZone) {
        this.followed = gameObject;
        this.xDeadZone = xDeadZone;
        this.yDeadZone = yDeadZone;
    },

    update : function () {
        // keep following the player (or other desired object)
        if (this.followed !== null) {
            if (this.axis === AXIS.HORIZONTAL || this.axis === AXIS.BOTH) {
                // moves camera on horizontal axis based on followed object position
                if (this.followed.x - this.xView + this.xDeadZone > this.wView) 
                    this.xView = this.followed.x - (this.wView - this.xDeadZone);
                else if (this.followed.x - this.xDeadZone < this.xView) 
                    this.xView = this.followed.x - this.xDeadZone;
            }
            if (this.axis === AXIS.VERTICAL || this.axis === AXIS.BOTH) {
                // moves camera on vertical axis based on followed object position
                if (this.followed.y - this.yView + this.yDeadZone > this.hView)
                    this.yView = this.followed.y - (this.hView - this.yDeadZone);
                else if (this.followed.y - this.yDeadZone < this.yView) 
                    this.yView = this.followed.y - this.yDeadZone;
            }
        }

        // update viewportRect
        this.viewportRect.set(this.xView, this.yView);

        // don't let camera leaves the world's boundary
        if (!this.viewportRect.within(this.worldRect)) {
            if (this.viewportRect.left < this.worldRect.left)
                this.xView = this.worldRect.left;
            if (this.viewportRect.top < this.worldRect.top)
                this.yView = this.worldRect.top;
            if (this.viewportRect.right > this.worldRect.right)
                this.xView = this.worldRect.right - this.wView;
            if (this.viewportRect.bottom > this.worldRect.bottom)
                this.yView = this.worldRect.bottom - this.hView;
        }
    },

    draw : function() {
        // do nothing
    }
}

function Map (width, height) {
    // map dimensions
    this.width = width;
    this.height = height;
}

Map.prototype = {
    generate : function (str, ctx) {
        var startX = 0, startY = 0;
        var blockSize = 50;
        for (var i = 0; i < str.length; i++) {
            if (str.charAt(i) === '\n') {
                startX = 0;
                startY += blockSize;
            } else if (str.charAt(i) === '-') {
                ctx.fillRect (startX, startY, blockSize, blockSize);
                startX += blockSize;
            } else if (str.charAt(i) === ' ') {
                startX += blockSize;
            }
        }
    },

    draw : function (context, xView, yView) {
        var sx = xView, sy = yView;
        var dx = 0, dy = 0;
        var sWidth = context.canvas.width, sHeight = context.canvas.height;
        var dWidth = sWidth, dHeight = sHeight;

        // context.drawImage(this.image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
    },

    update : function () {
        // do nothing
    }
}

var simpleLevelPlan = [
  "                      ",
  "                      ",
  "  x                x  ",
  "  x                x  ",
  "  x @      xxxxx   x  ",
  "  xxxxx            x  ",
  "      x            x  ",
  "      xxxxxxxxxxxxxx  ",
  "                      "
];

function Level (game, map) {
    this.width = map[0].length;
    this.height = map.length;
    this.grid = [];
    this.game = game;
    
    for (var y = 0; y < this.height; y += 1) {
        var line = map[y], gridLine = [];
        for (var x = 0; x < this.width; x += 1) {
            var ch = line[x], fieldType = null;
            if (ch === "x") {
                fieldType = "wall";
            } else if (ch === "@") {
                this.player = new Nitro(this.game, x, y)
            }
            gridLine.push(fieldType);
        }
        this.grid.push(gridLine);
    }
}

Level.prototype = {
    update : function () {},
    draw : function () {
        var scale = this.player.landWidth;
        this.game.ctx.fillStyle = "Green";
        for (int y = 0; y < this.grid.length; y += 1) {
            for (int x = 0; x < this.grid[0].length; x += 1) {
                this.game.ctx.fillRect (x * scale, y * scale, scale, scale);
            }
        }
    },

    obstacleAt : function (x, y, width, height) {
        var xStart = x;
        var xEnd = x + width;
        var yStart = y;
        var yEnd = y + height;

        if (xStart < 0 || xEnd > this.width || yStart < 0) {
            return "wall";
        }
        for (var y = yStart; y < yEnd; y += 1) {
            for (var x = xStart; x < xEnd; x += 1) {
                var fieldType = this.grid[y][x];
                if (fieldType) return fieldType;
            }
        }
    }
}





































