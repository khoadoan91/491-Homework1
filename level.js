function Level (map, game) {
    // suppose there is an image about the ground with the size
    this.blockSize = 50;
    this.width = map[0].length;
    this.height = map.length;
    this.width_px = this.width * this.blockSize;
    this.height_px = this.height * this.blockSize;
    console.log(this.width + "x" + this.height);
    console.log(this.width_px + "x" + this.height_px);
    this.grid = [];
    this.image = null;
    
    for (var y = 0; y < this.height; y += 1) {
        var line = map[y], gridLine = [];
        for (var x = 0; x < this.width; x += 1) {
            var ch = line[x], fieldType = null;
            switch (ch) {
                case "x" : fieldType = "ground"; break;
                case "|" : fieldType = "wall"; break;
                case "D" : fieldType = "door"; break;
                case "K" : fieldType = "key"; break;
                case "1" : fieldType = "groundStart"; break;
                case "2" : fieldType = "groundEnd"; break;
                case "@" : this.player = new Knight(x, y, game, this); break;
                default : break;
            }
            gridLine.push(fieldType);
        }
        this.grid.push(gridLine);
    }
}

Level.prototype = {
    // addHiddenMap : function (hiddenMap) {
    //     var width = hiddenMap[0].length;
    //     var height = hiddenMap.length;
    //     if (this.width !== width || this.height !== height) {
    //         console.error("Fail to add hiden map"); 
    //         return;
    //     }
        
    // },
    
    generate : function () {
        var ctx = document.createElement("canvas").getContext('2d');
        ctx.canvas.height = this.height_px;
        ctx.canvas.width = this.width_px;

        ctx.save();
        var trees_bg = ASSET_MANAGER.getAsset("assets/forest trees.png");
        var ground = ASSET_MANAGER.getAsset("assets/forest ground block.png");
        var belowGround = ASSET_MANAGER.getAsset("assets/ground block.png");
        var door = ASSET_MANAGER.getAsset("assets/tree outer door.png");
        var wall = ASSET_MANAGER.getAsset("assets/tree tile.png");
        
        var scale = Math.ceil((ctx.canvas.height * 2/3)/ trees_bg.height);
        var increment = trees_bg.width * scale;
        for (var i = 0; i < ctx.canvas.width; i += increment) {
            ctx.drawImage(trees_bg, 0, 0, trees_bg.width, trees_bg.height,
                        i, Math.ceil(ctx.canvas.height/3),
                        trees_bg.width*scale, trees_bg.height*scale);
        }
        
        for (var y = 0; y < this.grid.length; y += 1) {
            for (var x = 0; x < this.grid[0].length; x += 1) {
                var fieldType = this.grid[y][x];
                if (fieldType === "wall") {
                    ctx.drawImage(wall, 0, 0, wall.width, wall.height,
                                    x * this.blockSize, 
                                    y * this.blockSize, 
                                    this.blockSize, this.blockSize);
                } else if (fieldType === "ground") {
                   ctx.drawImage(ground, 0, 0, ground.width, ground.height, 
                                 x * this.blockSize, y * this.blockSize,
                                this.blockSize, this.blockSize);
                } else if (fieldType === "key") {
                    ctx.font = "48px serif";
                    ctx.fillText("Key", x * this.blockSize, y * this.blockSize);
                } else if (fieldType === "door") {
                    ctx.drawImage(door, 0, 0, door.width, door.height,
                                x * this.blockSize,
                                y * this.blockSize - 100, door.width, door.height);
                } else if (fieldType === "groundStart") {
                    var end = 50;
                    for (var i = y + 1; i < this.grid.length; i += 1) {
                        end += 50;
                        var groundEnd = this.grid[i][x];
                        if (groundEnd === "groundEnd") {break;}
                    }
                    ctx.drawImage(belowGround, 0, 0, belowGround.width, belowGround.height,
                                x * this.blockSize, y * this.blockSize,
                                belowGround.width, end);
                }
            }
        }
        ctx.restore();
        // store the generate map as this image texture
        this.image = new Image();
        this.image.setAttribute('crossOrigin', 'anonymous');
        this.image.src = ctx.canvas.toDataURL();
        console.log(this.image.src);
    },
    
    update : function () {},
    draw : function (ctx, xView, yView) {
        var sky_bg = ASSET_MANAGER.getAsset("assets/forest sky.png");
			
        var sx, sy, dx, dy;
        var sWidth, sHeight, dWidth, dHeight;

        // offset point to crop the image
        sx = xView;
        sy = yView;

        // dimensions of cropped image			
        sWidth =  ctx.canvas.width;
        sHeight = ctx.canvas.height;
        
        // if cropped image is smaller than canvas we need to change the source dimensions
        if(this.image.width - sx < sWidth){
            sWidth = this.image.width - sx;
        }
        if(this.image.height - sy < sHeight){
            sHeight = this.image.height - sy; 
        }

        // location on canvas to draw the croped image
        dx = 0;
        dy = 0;
        // match destination with source to not scale the image
        dWidth = sWidth;
        dHeight = sHeight;
        ctx.drawImage(sky_bg, 0, 0, 450, 300, dx, dy, dWidth, dHeight);
        ctx.drawImage(this.image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);	
    },

    obstacleAt : function (x, y, width, height) {
        var left = Math.floor(x / this.blockSize);
        var top = Math.floor(y / this.blockSize);
        var right = Math.floor((x + width) / this.blockSize);
        var bottom = Math.floor((y + height) / this.blockSize);
         if (left < 0 || right > this.width || top < 0) {
             return "wall";
         }

        for (var y = bottom; y >= top; y -= 1) {
            for (var x = left; x <= right; x += 1) {
                var fieldType = this.grid[y][x];
                if (fieldType) {return fieldType;}
            }
        }
    }
}


function Door (x, y, level, game) {
    Entity.call(this, x, y, 54, 54);
    this.game = game;
    this.level = level;
    this.isOpen = false;
}