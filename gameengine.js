/**
 * Created by KyleD on 1/11/16.
 */

KEY_CODES = {
    65 : 'a',
    68 : 'd',
    87 : 'w'
}

// GameEngine Constructor
function GameEngine() {
    this.entities = [];
    this.ctx = null;
    this.keyStatus = {keyDown : false};
}

// GameEngine methods
GameEngine.prototype = {
    init : function (ctx) {
        this.ctx = ctx;
        for (code in KEY_CODES) {
            this.keyStatus[KEY_CODES[code]] = false;
        }
        this.startInput();
    },

    start : function () {
        var that = this;
        (function gameLoop() {
            that.loop();
            requestAnimationFrame(gameLoop, that.ctx.canvas);
        })();
    },

    startInput : function () {
        var that = this;
        // keypressed: when holding a button, keypressed will fire the event rapidly
        this.ctx.canvas.addEventListener("keydown", function(event) {
            if (KEY_CODES[event.keyCode]) {
                that.keyStatus[KEY_CODES[event.keyCode]] = true;
                that.keyStatus.keyDown = true;
                event.preventDefault();
            }
        }, false);
        this.ctx.canvas.addEventListener("keyup", function(event) {
            if (KEY_CODES[event.keyCode]) {
                that.keyStatus.keyDown = false;
                that.keyStatus[KEY_CODES[event.keyCode]] = false;
                event.preventDefault();
            }
        }, false);
    },

    addEntity : function(entity) {
        this.entities.push(entity);
    },

    draw : function () {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.save();
        for (var i = 0; i < this.entities.length; i++) {
            this.entities[i].draw(this.ctx);
        }
        this.ctx.restore();
    },

    update : function () {
        var entitiesCount = this.entities.length;

        for (var i = 0; i < entitiesCount; i++) {
            var entity = this.entities[i];

            if (!entity.removeFromWorld) {
                entity.update();
            }
        }

        for (var i = this.entities.length - 1; i >= 0; i--) {
            if (this.entities[i].removeFromWorld) {
                this.entities.splice(i, 1);
            }
        }
    },

    loop : function () {
        this.update();
        this.draw();
    }
}
