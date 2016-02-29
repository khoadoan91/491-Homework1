function Level (game, music) {
    this.backgroundList = [];
    this.grid = [];
    this.characters = [];
    this.bossArea = null;
    this.removeCharacters = [];
    this.player = null;
    this.isWin = false;
    this.isGameOver = true;
    this.game = game;
    this.music = music;
}

Level.prototype = {

    addTitleScreen : function (img) {
        this.title = img;
    },

    addVictoryScreen : function (img) {
        this.vic = img;
    },

    switchAndPlayMusic : function (newMusic) {
        if (newMusic && this.music !== newMusic) {
            this.music = newMusic;
        } 
        this.music.stop();
        this.music.play();
    },

    parseLevelFile: function (inputArray) {
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
                    case "F" : block = new Door(x, y, wallBlock); break;
                    case "V" : block = new VictoryBlock(x, y, this); break;
                    case "!" : this.characters.push(new Skeleton(x, y, this)); break;
                    case "*" : this.characters.push(new Archer(x, y, this)); break;
                    case "w" : this.characters.push(new Wisp(x, y, this)); break;
                    case "o" : this.characters.push(new HealingStuff(x, y)); break;
                    case "I" : block = new InvisibleBlock(x, y, wallBlock); break;
                    case "@" :
                        this.player = new Knight(x, y, this.game, this);
                        this.characters.push(this.player);
                        break;
                    case "B" : this.readBossArea(inputArray, y, x); break;
                    default : break;
                }
                gridLine.push(block);
            }
            this.grid.push(gridLine);
        }
        for (var y = 0; y < this.height; y += 1) {
            for (var x = 0; x < this.width; x += 1) {
                var block = this.grid[y][x];
                if (block instanceof Door || block instanceof InvisibleBlock) {
                    block.setBossArea(this.bossArea);
                }
            }
        }
    },

    readBossArea : function (input, y, x) {
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
        var bossBg = AM.getAsset("./img/enemy/forest boss/forest boss background.png");
        this.bossArea = new BossArea(x, y, width, height, bossBg, this.game, this);
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

    update : function (tick) {
        if (!this.isGameOver) {
            // TODO Update all movement platforms

            // update all blocks
            for (var y = 0; y < this.height; y += 1) {
                for (var x = 0; x < this.width; x += 1) {
                    var block = this.grid[y][x];
                    if (block && !block.removeFromWorld) {
                        block.update(tick, this.player.currentX_px, this.player.currentY_px,
                            this.player.width, this.player.height);
                    }
                }
            }
            // update all characters
            for (var i = 0; i < this.characters.length; i += 1) {
                var actor = this.characters[i];
                if (!actor.removeFromWorld) {
                    actor.update(tick, this.player.currentX_px, this.player.currentY_px,
                        this.player.width, this.player.height);
                }
            }
            // remove the characters that are killed
            for (var i = this.characters.length - 1; i >= 0; i -= 1) {
                if (this.characters[i].removeFromWorld) {
                    var character = this.characters.splice(i, 1)[0];
                    this.removeCharacters.push(character);
                }
            }
            this.bossArea.update(tick, this.player.currentX_px, this.player.currentY_px,
                this.player.width, this.player.height);
            if (this.player.removeFromWorld) {
                this.isGameOver = true;
            }
        } else if (this.game.click) {
            this.reset();
            this.isGameOver = false;
        } else if (this.isWin) {
            // TODO tell game engine to break the requestAnimationFrame
        }
    },

    resetCamera : function () {
        this.game.camera.follow(this.player, this.game.ctx.canvas.width/2 - 120,
            this.game.ctx.canvas.height/2 - 120);
    },

    resetBossArea : function () {
        if (this.player.currentX_px > this.bossArea.currentX_px &&
                this.player.currentY_px > this.bossArea.currentY_px) {
            this.bossArea.reset();
            this.resetCamera();
        }
        this.switchAndPlayMusic(BGM.forestLevel);
    },

    reset : function () {
        for (var i = this.removeCharacters.length - 1; i >= 0; i -= 1) {
            var actor = this.removeCharacters.splice(i, 1)[0];
            if (actor instanceof Arrow) continue;
            actor.reset();
            this.characters.push(actor);
        }
        this.game.timer.gameTime = 0;
        this.switchAndPlayMusic(BGM.forestLevel);
    },
    
    draw : function (ctx, cameraRect, tick) {
        if (!this.isGameOver && !this.isWin) {
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
            for (var i = 0; i < this.characters.length; i += 1) {
                this.characters[i].draw(ctx, cameraRect, tick);
            }
        } else if (this.isGameOver) {
            ctx.drawImage(this.title, 0, 0, this.title.width, this.title.height);
        } else if (this.isWin) {
            ctx.drawImage(this.vic, 0, 0, this.vic.width, this.vic.height);
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
                if (fieldType && fieldType.isColidable) {return fieldType;}
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
                                allChar.push({isBeingAttacked : false, isAlive : true});
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

function Foreground (x, y, xEnd, yEnd) {
    this.xStart = x || null;
    this.yStart = y || null;
    this.yEnd = yEnd || null;
    this.xEnd = xEnd || null;
}

Foreground.prototype = {
    set : function (x, y) {
        if (this.xStart === null || this.xStart > x) {
            this.xStart = x;
        }
        if (this.yStart === null || this.yStart > y) {
            this.yStart = y;
        }
        if (this.xEnd === null || this.xEnd < x) {
            this.xEnd = x;
        }
        if (this.yEnd === null || this.yEnd < y) {
            this.yEnd = y;
        }
    },
    
    findItselfOnMap : function () {
        this.left = this.xStart * GAME_CONSTANT.BLOCK_SIZE;
        this.right = (this.xEnd + 1) * GAME_CONSTANT.BLOCK_SIZE;
        this.top = this.yStart * GAME_CONSTANT.BLOCK_SIZE;
        this.bottom = (this.yEnd + 2) * GAME_CONSTANT.BLOCK_SIZE;
        this.width = this.right - this.left;
        this.height = this.bottom - this.top;
    }
}

function Door (x, y) {
    Entity.call(this, x, y, GAME_CONSTANT.BLOCK_SIZE, GAME_CONSTANT.BLOCK_SIZE);
    this.x = x;
    this.y = y;
    var door = AM.getAsset("./img/forest-stage/tree outer door.png");
    var doorBlock = new Animation(door, door.width, door.height, 1, true);
    doorBlock.addFrame(0,0);
    this.animationList.push(doorBlock);
}

Door.prototype = new Entity();
Door.prototype.constructor = Door;
Door.prototype.assignHiddenPlace = function (foreground) {
    if (this.y === foreground.yEnd ||
        this.x + 1 === foreground.xStart ||
        this.x - 1 === foreground.xEnd ||
        this.y === foreground.yStart) {
        this.foreground = foreground;
        this.showHidden = false;
    } 
}