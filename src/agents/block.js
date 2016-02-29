function Block (x, y, blockAnimation) {
   this.x = x;  // coordinate of the block of the map
   this.y = y;  // coordinate of the block of the map
   Entity.call(this, x, y, GAME_CONSTANT.BLOCK_SIZE, GAME_CONSTANT.BLOCK_SIZE);

   this.animationList.push(blockAnimation);
}

Block.prototype = new Entity();
Block.prototype.constructor = Block;

function Door (x, y, wallBlock) {
    Block.call(this, x, y, wallBlock);
    var doorBlock = new Animation(AM.getAsset("./img/forest-stage/tree outer door.png"),
            GAME_CONSTANT.BLOCK_SIZE, GAME_CONSTANT.BLOCK_SIZE, 1, true);
    doorBlock.addFrame(0,0);
    this.animationList.push(doorBlock);
}

Door.prototype = new Block();
Door.prototype.constructor = Door;
