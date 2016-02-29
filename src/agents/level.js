function Level () {
    this.backgroundList = [];
    this.grid = [];
    this.characters = [];
    this.bossArea = null;
    this.removeCharacters = [];
}

Level.prototype = {

    parseLevelFile: function (inputArray, game) {
        this.height = inputArray.length;
        this.width = inputArray[0].length;
        this.width_px = this.width * GAME_CONSTANT.BLOCK_SIZE;
        this.height_px = this.height * GAME_CONSTANT.BLOCK_SIZE;
        console.log("Map dimension: " + this.width + "x" + this.height);
        console.log("Map dimension in pixel: " + this.width_px + "x" + this.height_px);

        var forestBlock = new Animation(AM.getAsset("./img/forest-stage/forest ground block.png"),
                GAME_CONSTANT.BLOCK_SIZE, GAME_CONSTANT.BLOCK_SIZE, 1, true);
        forestBlock.addFrame(0,0);
        var wallBlock = new Animation(AM.getAsset("./img/forest-stage/tree tile.png"),
                GAME_CONSTANT.BLOCK_SIZE, GAME_CONSTANT.BLOCK_SIZE, 1, true);
        wallBlock.addFrame(0,0);
        var doorBlock = new Animation(AM.getAsset("./img/forest-stage/tree outer door.png"),
                GAME_CONSTANT.BLOCK_SIZE, GAME_CONSTANT.BLOCK_SIZE * 3, 1, true);
        doorBlock.addFrame(0,0);

        var currentX = 0;
        var currentY = 0;

        for (var y = 0; y < this.height; y += 1) {
            var gridLine = [];
            for (var x = 0; x < this.width; x += 1) {
                var currentSymbol = inputArray[y][x], block = null;
                switch (currentSymbol) {
                    case "x" : block = new Block(x, y, forestBlock); break;
                    case "|" : block = new Block(x, y, wallBlock); break;
                    case "F" : block = new FinishDoor(x, y, doorBlock); break;
                    case "!" : this.characters.push(new Skeleton(x, y, this)); break;
                    case "*" : this.characters.push(new Archer(x, y, game, this)); break;
                    case "w" : this.characters.push(new Wisp(x, y, this)); break;
                    case "o" : this.characters.push(new HealingStuff(x, y)); break;
                    case "D" : block = new Door(x, y, wallBlock); this.bossArea.door = block; break;
                    // case "0" : block = "hidden"; foreground.set(x, y); break;
                    case "@" :
                        this.player = new Knight(x, y, game, this);
                        this.characters.push(this.player);
                        break;
                    case "B" : this.readBossArea(inputArray, y, x, game); break;
                    default : break;
                }
                gridLine.push(block);
            }
            this.grid.push(gridLine);
        }
    },

    readBossArea : function (input, y, x, game) {
        var height = 0, width = 0;
        for (var row = y; row < this.height; row += 1) {
            height += GAME_CONSTANT.BLOCK_SIZE;
            width = 0;
            for (var col = x; col < this.width; col += 1) {
                width += GAME_CONSTANT.BLOCK_SIZE;
                if (input[row][col] === "E") {
                    row = this.height; col = this.width;
                }
            }
        }
        console.log("Boss area width x height: " + width + "x" + height);
        var bossBg = AM.getAsset("./img/enemy/boss/forest boss background.png");
        this.bossArea = new BossArea(x, y, width, height, bossBg, game, this);
    },

    /**
     * Add a new background to the stage.
     * If the background is static, just pass one parameter
     * Otherwise, set the second parameter true.
     * The next two parameter decides where the background will start and the scale respects to the real map.
     */
    addBackground: function (background, isMoving, startFromBottom, scaleToWorldMap) {
        var canMove = isMoving || false;
        var scaleToMap = scaleToWorldMap || 1;
        var startFromBot = startFromBottom || false;
        var bg = new Background(background, canMove, startFromBot, scaleToMap);
        this.backgroundList.push(bg);
    },

    drawBackground: function (ctx, xView, yView) {
        for (var i = 0; i < this.backgroundList.length; i += 1) {
            var img = this.backgroundList[i].img;
            var scale = this.backgroundList[i].scale;
            var xStart = 0, yStart = 0;
            // I suppose that when a img is not moving. the img will be the same size of the canvas.
            // FIXME there is some issues when the background is not moving. In this map, it will work
            // It won't work if set up a different way.
            if (!this.backgroundList[i].isMoving) { // the background is not moving
                if (this.backgroundList[i].startFromBottom) {  // the background starts from bottom
                    yStart = (1 - scale) * ctx.canvas.height;
                } // if the background starts from top, yStart is still 0
                ctx.drawImage(img, xStart, yStart, ctx.canvas.width * scale, ctx.canvas.height * scale);
            } else {    // the background is moving with the character
                // how many pics will be drawn in canvas.
                var pics = Math.ceil(ctx.canvas.width / img.width);
                // the real scale respect to the canvas.
                var s = this.height_px * scale / img.height;
                // the position that img will start to draw.
                xStart = img.width * s * Math.floor(xView / (img.width * s)) - xView;
                yStart = - yView;
                if (this.backgroundList[i].startFromBottom) {  // the background starts from top
                    yStart = (1 - scale) * this.height_px - yView;
                }
                // console.log(xStart);
                for (var j = 0; j <= pics; j += 1) {
                    // console.log(pics);
                    // console.log(yStart + " " + ctx.canvas.height * scale);
                    ctx.drawImage(img, xStart, yStart, img.width * s, img.height * s);
                    xStart += (img.width * s);
                }
            }
        }
    },

    update : function (tick, posX, posY, width, height) {
        // TODO Update all movement platforms

        // remove the characters that are killed
        for (var i = this.characters.length - 1; i >= 0; i -= 1) {
            if (this.characters[i].removeFromWorld) {
                var character = this.characters.splice(i, 1)[0];
                this.removeCharacters.push(character);
            }
        }
        this.bossArea.update(tick, posX, posY, width, height);
    },

    reset : function () {
        for (var i = this.removeCharacters.length - 1; i >= 0; i -= 1) {
            var actor = this.removeCharacters.splice(i, 1)[0];
            // console.log(actor.spawnX + " " + actor.spawnY);
            actor.currentX_px = actor.spawnX;
            actor.currentY_px = actor.spawnY;
            actor.removeFromWorld = false;
            actor.isAlive = true;
            actor.health = actor.maxHealth;
            this.characters.push(actor);
        }
        // this.removeCharacters = [];
    },

    draw : function (ctx, cameraRect, tick) {
        this.drawBackground(ctx, cameraRect.left, cameraRect.top);
        this.bossArea.draw(ctx, cameraRect, tick);

        for (var y = 0; y < this.grid.length; y += 1) {
            for (var x = 0; x < this.grid[0].length; x += 1) {
                var block = this.grid[y][x];
                if (block) {
                    block.draw(ctx, cameraRect, tick);
                }
            }
        }
    },

    /**
     * Check if there is an obstacle at the position x, y with the width and height of the entity.
     */
    obstacleAt : function (x, y, width, height) {
        var left = Math.floor(x / GAME_CONSTANT.BLOCK_SIZE);
        var top = Math.floor(y / GAME_CONSTANT.BLOCK_SIZE);
        var right = Math.floor((x + width) / GAME_CONSTANT.BLOCK_SIZE);
        var bottom = Math.floor((y + height) / GAME_CONSTANT.BLOCK_SIZE);
        if (left < 0 || right > this.width || top < 0) {
            return "wall";
        }

        for (var row = bottom; row >= top; row -= 1) {
            for (var col = left; col <= right; col += 1) {
                var fieldType = this.grid[row][col];
                // if (fieldType === "hidden") {continue};
                // if (fieldType === "door") {
                //     for (var i = 0; i < this.door.length; i += 1) {
                //         if (this.door[i].x === x) {return this.door[i]};
                //     }
                // }
                if (fieldType) {return fieldType;}
            }
        }
        var boss = this.bossArea.boss;
        for (var i = 0; i < boss.arms.length; i += 1) {
            var arm = boss.arms[i];
            if (arm.currentAnimation === ARM_ATTR.PLATFORM) {
                if (x + width > arm.currentX_px &&
                    x < arm.currentX_px + arm.width &&
                    y + height > arm.currentY_px &&
                    y < arm.currentY_px + arm.height) {
                        return arm;
                    }
            }
        }
    },

    /**
     * Check if there is any enemy nearby.
     */
    enemyAt : function (player) {
        var allChar = [];
        for (var i = 0; i < this.characters.length; i += 1) {
            var character = this.characters[i];
            if (player !== character &&
                player.currentX_px + player.width > character.currentX_px &&
                player.currentX_px < character.currentX_px + character.width &&
                player.currentY_px + player.height > character.currentY_px &&
                player.currentY_px <= character.currentY_px + character.height + 0.1) // offset between top and bottom
                allChar.push(character);
        }
        if (player.currentX_px > this.bossArea.currentX_px &&
            player.currentY_px > this.bossArea.currentY_px) {
                var boss = this.bossArea.boss;
                for (var i = 0; i < boss.arms.length; i += 1) {
                    var arm = boss.arms[i];
                    if (arm.currentAnimation !== ARM_ATTR.PLATFORM) {
                        if (player.currentX_px + player.width > arm.currentX_px &&
                            player.currentX_px < arm.currentX_px + arm.width &&
                            player.currentY_px + player.height > arm.currentY_px &&
                            player.currentY_px < arm.currentY_px + arm.height) {
                                allChar.push("spike-arm");
                            }
                    }
                }
            }
        return allChar;

    }
}

function Background (img, isMoving, startFromBottom, scale) {
    this.img = img;
    this.scale = scale;
    this.startFromBottom = startFromBottom;
    this.isMoving = isMoving;
}
