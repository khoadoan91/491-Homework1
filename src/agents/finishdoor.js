function FinishDoor(x, y, doorAnimation) {
    Block.call(this, x, y, doorAnimation);
    this.currentY_px -= 100;
}

FinishDoor.prototype = new Block();
FinishDoor.prototype.constructor = FinishDoor;
