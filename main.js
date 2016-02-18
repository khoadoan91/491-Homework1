var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("assets/knight atk sheet.png");
ASSET_MANAGER.queueDownload("assets/knight atk sheet flipped.png");
ASSET_MANAGER.queueDownload("assets/knight jump sheet.png");
ASSET_MANAGER.queueDownload("assets/knight jump sheet flipped.png");
ASSET_MANAGER.queueDownload("assets/knight run.png");
ASSET_MANAGER.queueDownload("assets/knight run flipped.png");
ASSET_MANAGER.queueDownload("assets/knight standing.png");
ASSET_MANAGER.queueDownload("assets/knight standing flipped.png");
ASSET_MANAGER.queueDownload("assets/forest ground block.png");
ASSET_MANAGER.queueDownload("assets/ground block.png");
ASSET_MANAGER.queueDownload("assets/tree outer door.png");
ASSET_MANAGER.queueDownload("assets/tree tile.png");
ASSET_MANAGER.queueDownload("assets/tree tile inner.png");
ASSET_MANAGER.queueDownload("assets/forest sky.png");
ASSET_MANAGER.queueDownload("assets/forest trees.png");

/*
Download all the elements and add entities to the game.
*/
ASSET_MANAGER.downloadAll(function () {
    console.log("Initializing world");
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');
    var simpleLevelPlan = [
"|                                                                     |             |",
"|                                                                     |             |",
"|                                                                     |             |",
"|                                                                     |             |",
"|                                                                     |             |",
"|                                   xxxxxxxxxxxxxxxx   xxxx     xxxx  |             |",
"|                                       |0000000000|                  |             |",
"|                        xxx  xx        |0000000000|       xx         |             |",
"|                          |            |0000000000|              xxxx|             |",
"|                          |      xxx   |000000xxxx|                  |             |",
"|                    xxx   |            |0000000000|         xxx                    |",
"|                          |            |xxx0000000|                                D",
"|                          |   xx       |0000000000|              xxxxxxxxxxxxxxxxxx|",
"|                        xx|            |0000000000|                  |             |",
"|                          |       xx   |000000xxxx|                  |             |",
"|            x             |  @         |0000000000|          xxxx    |             |",
"|            |      xxx    |            D0000000000|                  |             |",
"|           x|      | |  xx|xxxxxxxxxxxx|xxxxxxxxx0|xxxxxxxxxxxxxxxxxx|             |",
"|xxx     xxx |     x   xx                                                           |",
"|   xxxxx    |xxxxxx                                                                |"
    ];

    var game = new GameEngine(ctx);
    var lv1 = new Level(simpleLevelPlan, game);
    lv1.generate();
    var camera = new Camera(0, 0, canvas.width, canvas.height, lv1.width_px, lv1.height_px);
    camera.follow(lv1.player, canvas.width/2 - 120, canvas.height/2 - 120);
    game.init(camera);
    
    game.addEntity(lv1);
    game.addEntity(lv1.player);
    game.start();
    
});

var BLOCK_SIZE = 50;

function Entity (x, y, width, height) {
    this.currentX_px = x * BLOCK_SIZE;
    this.currentY_px = y * BLOCK_SIZE;
    this.width = width;
    this.height = height;
}

Entity.prototype = {
    update : function () {},
    draw : function (ctx) {}
}

function Knight (x, y, game, level) {
    Entity.call(this, x, y, 54, 54);
    this.game = game;
    this.level = level;
    this.xVelocity = 0;
    this.yVelocity = 0;
    
    this.maxSpeed = 12;
    this.gravity = 0.5;
    
    //setting up gamestate bools
    this.removeFromWorld = false;
    this.isStanding = true;
    this.isRunning = false;
    this.isJumping = false;
    this.isFalling = true;
    
    this.standing = new Animation(ASSET_MANAGER.getAsset("assets/knight standing.png"),
        0, 0, ASSET_MANAGER.getAsset("assets/knight standing flipped.png"),
        0, 0, 48, 54, 1, 1, false, true);
    this.jumping = new Animation(ASSET_MANAGER.getAsset("assets/knight jump sheet.png"),
        0, 0, ASSET_MANAGER.getAsset("assets/knight jump sheet flipped.png"),
        52, 0, 52, 61, 2, 1, false, true);
    this.running = new Animation(ASSET_MANAGER.getAsset("assets/knight run.png"),
        0, 0, ASSET_MANAGER.getAsset("assets/knight run flipped.png"),
        162, 0, 54, 54, 4, 0.05, false, true);
}
Knight.prototype = new Entity();
Knight.prototype.constructor = Knight;

Knight.prototype.moveX = function () {
    if (this.game.keyStatus["d"])  {
        this.standing.isFlipped = false;
        this.jumping.isFlipped = false;
        this.running.isFlipped = false;
        this.isRunning = true;
        this.isStanding = false;
        this.xVelocity = 4;
    } else if (this.game.keyStatus["a"]) {
        this.standing.isFlipped = true;
        this.jumping.isFlipped = true;
        this.running.isFlipped = true;
        this.isRunning = true;
        this.isStanding = false;
        this.xVelocity = -4;
    } else if (!this.game.keyStatus["d"] && !this.game.keyStatus["a"]) {
        this.xVelocity = 0;
        this.isRunning = false;
        this.isStanding = true;
    }
    var tempX = this.currentX_px + this.xVelocity;
    var obstacle = this.level.obstacleAt(tempX, this.currentY_px, this.width, this.height);
    if (!obstacle) {
        this.currentX_px = tempX;
    } else if (obstacle.fieldType === "door") {
        // TODO activate the button.
        this.level.displayHidden(this.currentX_px, this.currentY_px, obstacle);
        this.currentX_px = tempX;
    }
};

Knight.prototype.moveY = function () {
    if (this.yVelocity < this.maxSpeed) {
        this.yVelocity += this.gravity;
    }
    var tempY = this.currentY_px + this.yVelocity;
    var obstacle = this.level.obstacleAt(this.currentX_px, tempY, this.width, this.height);
    if (!obstacle || obstacle.fieldType === "door") {
        this.currentY_px = tempY;
    } else {
        if (this.game.keyStatus["w"] && this.yVelocity > 0) {
            this.isJumping = true; this.isStanding = false;
            this.yVelocity = -15;
        } else {
            if (this.yVelocity > 0) { 
                this.isJumping = false;
            }
            this.yVelocity = 0;
        }
    }
    if (this.yVelocity > 0) {
        this.isFalling = true;
    } else if (this.yVelocity < 0) {
        this.isFalling = false;
    }
//    console.log(this.yVelocity);
//    console.log ("is Jumping " + this.isJumping + " is Falling " + this.isFalling);
}

Knight.prototype.update = function () {
    var step = this.game.clockTick;
    if (this.game.keysDown) {
        this.running.elapsedTime += step;
    } else {
        if (!this.isJumping && !this.isFalling) {
            this.isStanding = true;
        }
    }
    this.moveX();
    this.moveY();
    
//    if (this.isJumping) {
//        this.jumping.elapsedTime += step;
//        if (this.jumping.isDone()) {
//            this.jumping.elapsedTime = 0;
//            this.isJumping = false;
//            this.isStanding = true;
//        }
//    }
//    console.log("isJumping " + this.isJumping + ", isStanding " + this.isFalling);
    Entity.prototype.update.call(this);
};

Knight.prototype.draw = function (ctx, xView, yView) {
    if (this.isJumping) {
        this.jumping.drawFrame(ctx, this.currentX_px - xView, this.currentY_px - yView, this.isFalling);
    } else if (this.isRunning) {
        this.running.drawFrame(ctx, this.currentX_px - xView, this.currentY_px - yView);
    } else if (this.isStanding) {
        this.standing.drawFrame(ctx, this.currentX_px - xView, this.currentY_px - yView);
    } 
    Entity.prototype.draw.call(this);
};

//function Nitro (x, y, game, level) {
//     Entity.call(this, x, y, 54, 54);
//     this.game = game;
//     this.level = level;
//     // this.currentX_px = x;
//     // this.currentY_px = y;
//     // this.width = 50;
//     // this.height = 42;
//     this.xVelocity = 0;
//     this.yVelocity = 0;
//
//     this.gravity = 10;
//     this.weight = 1;
//     this.removeFromWorld = false;
// }
//
// Nitro.prototype = new Entity();
// Nitro.prototype.constructor = Nitro;
//
// Nitro.prototype.moveX = function () {
//     if (this.game.keyStatus["d"]) {
//         this.xVelocity = 4;
//     } else if (this.game.keyStatus["a"]) {
//         this.xVelocity = -4;
//     } else if (!this.game.keyStatus["d"] && !this.game.keyStatus["a"]) {
//         this.xVelocity = 0;
//     }
//     var tempX = this.currentX_px + this.xVelocity;
//     var obstacle = this.level.obstacleAt(tempX, this.currentY_px, this.width, this.height);
//     if (obstacle) {
//         // if (!this.isColliding(obstacle)) {
//         //     this.currentX_px = tempX;
//         // } 
//     } else {
//         this.currentX_px = tempX;
//     }
// };
//
// Nitro.prototype.moveY = function () {
//     if (this.yVelocity < this.gravity) {
//         this.yVelocity += this.weight;
//     }
//     var tempY = this.currentY_px + this.yVelocity;
//     var obstacle = this.level.obstacleAt(this.currentX_px, tempY, this.width, this.height);
//     if (obstacle) {
//         // if (!this.isColliding(obstacle)) {
//         //     this.currentY_px = tempY;
//         // }
//         if (this.game.keyStatus["w"] && this.yVelocity > 0) {
//             this.yVelocity = -17;
//         } else {
//             this.yVelocity = 0;
//         }
//     } else {
//         this.currentY_px = tempY;
//     }
// }
//
// Nitro.prototype.update = function () {
//     var step = this.game.clockTick;
//     this.moveX();
//     this.moveY();
//     Entity.prototype.update.call(this);
// };
//
// Nitro.prototype.draw = function (ctx) {
//     ctx.fillStyle = "Red";
//     ctx.fillRect(this.currentX_px,
//                     this.currentY_px,
//                     this.width, this.height);
//     Entity.prototype.draw.call(this);
// };
//
// Nitro.prototype.isColliding = function (other) {
//     //    __t__
//     // l |other|        _top_
//     //   |_____|   left|this | 
//     //                 |_____|
//     var left = this.currentX_px - Math.floor(this.width / 2);
//     var top = this.currentY_px - Math.floor(this.height / 2);
//     var right = left + this.width;
//     var bottom = top + this.height;
//     console.log(bottom + " " + other.top);
//
//     if (left > other.right) return false;
//     if (right < other.left) return false;
//     if (top > other.bottom) return false;
//     if (bottom < other.top) return false;
//     return true;
// };


