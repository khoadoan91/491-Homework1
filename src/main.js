//This should eventually be moved into the data for an individual level
//Perhaps these could be passed in to levels as we make them and then we can call <StageVar>.playBGM() ?
//One area of concern is that the way these currently loaded in to the page. It's probably embedded music in the page queueing and finishing that causes the burst of slowdown.
//I don't mind the magic numbers so much here, since I think they're only used here and they have particular timestamps, but we could make them globals if enough people hate them.
var BGM = {
    forestLevel : new Howl({
        urls: ['./snd/megalovania.mp3'],
        volume: 0.5,
        loop: true
    }),

    forestBoss: new Howl({
        urls: ['./snd/cornered.mp3'],
        volume: 0.5,
        loop: true,
    }),

    victoryFanfare: new Howl({
        urls: ['./snd/fanfare.mp3'],
        volume: 0.5,
        loop: false,
    }),

    castleLevel : new Howl({
        urls: ['./snd/'],
        volume: 0.5,
        loop: true,
    }),

    castleBoss : new Howl({
        urls: ['./snd/'],
        volume: 0.5,
        loop: true,
    })
};

var BOSS_LEVEL = {
    FOREST_BOSS : 0,
    CASTLE_BOSS : 1
}

var AM = new AssetManager();

AM.queueDownload("./img/knight/knight jump.png");
AM.queueDownload("./img/knight/knight jump flipped.png");
AM.queueDownload("./img/knight/knight run.png");
AM.queueDownload("./img/knight/knight run flipped.png");
AM.queueDownload("./img/knight/knight standing.png");
AM.queueDownload("./img/knight/knight standing flipped.png");
AM.queueDownload("./img/knight/knight attack.png");
AM.queueDownload("./img/knight/knight attack flipped.png");

AM.queueDownload("./img/forest-stage/forest ground block.png");
AM.queueDownload("./img/forest-stage/tree tile.png");
AM.queueDownload("./img/forest-stage/forest sky.png");
AM.queueDownload("./img/forest-stage/forest trees.png");
AM.queueDownload("./img/castle-stage/castle block.png");
AM.queueDownload("./img/castle-stage/castle background.png");

AM.queueDownload("./img/enemy/chaser.png");
AM.queueDownload("./img/enemy/archer.png");
AM.queueDownload("./img/enemy/wisp.png");
AM.queueDownload("./img/enemy/death anim.png");

AM.queueDownload("./img/enemy/forest boss/forest boss background.png");
AM.queueDownload("./img/enemy/forest boss/forest boss dust.png");
AM.queueDownload("./img/enemy/forest boss/forest boss spike 50px.png");
AM.queueDownload("./img/enemy/forest boss/forest boss spike 100px.png");
AM.queueDownload("./img/enemy/forest boss/forest boss spike 150px.png");
AM.queueDownload("./img/enemy/forest boss/forest boss platform.png");
AM.queueDownload("./img/enemy/forest boss/forest boss weak point.png");
AM.queueDownload("./img/enemy/forest boss/forest boss statue arm1.png");
AM.queueDownload("./img/enemy/forest boss/forest boss statue arm2.png");
AM.queueDownload("./img/enemy/forest boss/forest boss statue chest.png");
AM.queueDownload("./img/enemy/forest boss/forest boss statue base.png");
AM.queueDownload("./img/enemy/forest boss/forest boss statue idle.png");

AM.queueDownload("./img/other/victory screen.png");
AM.queueDownload("./img/other/title screen.png");

// AM.queueStageDownload("./txt/forest-stage.txt");

/*
Download all the elements and add entities to the game.
*/
AM.downloadAll(function () {
    console.log("Initializing world");
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');
    var game = new GameEngine(ctx);
    var player = new Knight(game);
    var forestLevel = new Level(game, BGM.forestLevel, BGM.forestBoss);
    var forestMap = [
"                                    |                                                |      ",
"                                    |                                                |      ",
"                                    |                                                |      ",
"                                    |                                                |      ",
"                                    |                                                |      ",
"                                    |                                                |      ",
"                                    |                                                |      ",
"                                    |                 !               !              |     V",
"                                    |      xxxxxxx   xxxx  xxxx      xxx             |    xx",
"                                    |        |                              xxxx     |      ",
"                                    |xxx     |                                       |      ",
"                                    |        |                                       |      ",
"                                    | *                  *   xxx        xxx          |xx    ",
"                                    |xxx                xxx       xxx        xx      |      ",
"                                    |                   x                            |      ",
"                                    |      xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx       |      ",
"                                    |        |                                     * |    xx",
"                                    |   x    |                                    xxx|      ",
"                                    |   xx   |                                       |      ",
"                                    |   xx   |                                       |      ",
"                                    |   xx   |         *        w        *           |xx    ",
"                                    |x  xxx  |x  |xx  xxxxxxxxxxxxxx   xxxxxx    xxxx|      ",
"                                    |        |   |                                   |      ",
"                                    |      ! |   |                             !     |      ",
"                                    |      xx|   |                            xx     |    xx",
"                                    |        |   |    !          !            xx    o|      ",
"                                    |      ! |   |xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx|      ",
"                     x                   xxxx|               |B                      |      ",
"                      x                      |               |                       |xx    ",
"                       x            *       o|o    @         I                       |      ",
"               w        x        xxxxxxxxxxxxxxxxxxxxxxxxx   I                       |      ",
"              xxx               w|                       |   I                       |      ",
"              | |              xxx                       |xxxx                       |    xx",
"         xx   | |       !      |                             |                       |      ",
"              | |xxxxxxxxxxxxxxx                             |                       |      ",
"              |                                              |                       |      ",
"     x     !! |                                              |                       |xx    ",
"xxxxx|xxxxxxxxx                                              |                       D      ",
"                                                             |                      ED      ",
"                                                             |xxxxxxxxxxxxxxxxxxxxxxx|xxxxxx",
    ];
    var forestBlock = {
        "x" : new Animation(AM.getAsset("./img/forest-stage/forest ground block.png"),
                GAME_CONSTANT.BLOCK_SIZE, GAME_CONSTANT.BLOCK_SIZE, 1, true),
        "|" : new Animation(AM.getAsset("./img/forest-stage/tree tile.png"),
                GAME_CONSTANT.BLOCK_SIZE, GAME_CONSTANT.BLOCK_SIZE, 1, true)
    };
    forestBlock["x"].addFrame(0, 0);
    forestBlock["|"].addFrame(0, 0);

    var castleLevel = new Level(game, BGM.castleLevel, BGM.castleBoss);
    var castleMap = [
"                                                                                                xxxxxxxxxxxxxxx                                 ",
"                                                                                                              x                                 ",
"                                                                                                              x                                 ",
"                    xxxxx                                                                       xxxxxx        x                                 ",
"                   x                                                                      xxxxxx     x        x                                 ",
"                  x                                                                  xxxxx           x        x                                 ",
"                 xx                                                             xxxxx                 x        x                                ",
"         x                                                                 xxxxx                      x        x                                ",
"         x                                                            xxxxx                           x        x                                ",
"         x                                                       xxxxx                                x        x                                ",
"          x                                                 xxxxx                                    x        x                                 ",
"              xx                                       xxxxx                                                  x                                 ",
"               x                                  xxxxx                                                       x                                 ",
"               x                             xxxxx    x                                                       x                                 ",
"             xxx                        xxxxx         x         xxx         xxxx     xxxx         xxxxxxxxxxxxxx                                ",
"                                   xxxxx              x                                       xxxx    x        x                                ",
"                                   x                  x                                               x        x                                ",
"          xxx                      x                  x                                                       xxxxxxxxxxxxxxxxxxxxxxxxxx        ",
"             xxx                   x                  xxxx                                                    xx                       x        ",
"                xxx                x                                    xxx               xxx                 xx                       x        ",
"                        x          x                            xx             x                     x        xx                       x        ",
"                         x    x    x                                               xx                x        xx                       x        ",
"                             x     x                                                                 xxxxxx    x                       x        ",
"                            x      x                                                                           x                       x        ",
"     x                     x       x                                                                           x                       x        ",
"    x x                   xx       x                                              xxxxx                   xxxxxx                       x        ",
"   x                    xx         x                        xxxxx                x           xxxx      xxx                             x        ",
"   x                               x               xx                    xxxx                                                          x        ",
"   x                               x    x                                                                         xxxxxxxxxxxxxxxxx    xxxxxxxxx",
"   xxxx                            x    x                                                                                                       ",
"                        xxxx       x     x                                                                                                      ",
"                                   x      x                          x                  x xx            xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
"                                  x        xxxx        xx     xx      x            x  x     xx        xx                                        ",
"@                                x                   xx                       xx              xxxxxxxx                                          ",
"xxxxx    xxxxx     xxxx      xxxx                                                                                                               ",
"xxxx       xx       xx        xx                                                                                                                ",
    ];
    var castleBlock = {
        "x" : new Animation(AM.getAsset("./img/castle-stage/castle block.png"),
                GAME_CONSTANT.BLOCK_SIZE, GAME_CONSTANT.BLOCK_SIZE, 1, true),
        "|" : new Animation(AM.getAsset("./img/castle-stage/castle block.png"),
                GAME_CONSTANT.BLOCK_SIZE, GAME_CONSTANT.BLOCK_SIZE, 1, true)
    };
    castleBlock["x"].addFrame(0, 0);
    castleBlock["|"].addFrame(0, 50);

    // forestLevel.parseLevelFile(AM.getAsset("./txt/forest-stage.txt").split("\n"), game);
    forestLevel.parseLevelFile(forestMap, forestBlock, BOSS_LEVEL.FOREST_BOSS);
    forestLevel.addBackground(AM.getAsset("./img/forest-stage/forest sky.png"));
    forestLevel.addBackground(AM.getAsset("./img/forest-stage/forest trees.png"), true, true, 3/4);
    forestLevel.addTitleScreen(AM.getAsset("./img/other/title screen.png"));
    forestLevel.addVictoryScreen(AM.getAsset("./img/other/victory screen.png"));

    castleLevel.parseLevelFile(castleMap, castleBlock, BOSS_LEVEL.CASTLE_BOSS);
    castleLevel.addBackground(AM.getAsset("./img/castle-stage/castle background.png"), true, true);
    castleLevel.addTitleScreen(AM.getAsset("./img/other/title screen.png"));
    castleLevel.addVictoryScreen(AM.getAsset("./img/other/victory screen.png"));

    var camera = new Camera(0, 0, canvas.width, canvas.height, forestLevel.width_px, forestLevel.height_px);
    camera.follow(forestLevel.player, canvas.width/2 - 120, canvas.height/2 - 120);
    game.init(camera);
    game.addLevel(forestLevel);
    game.addLevel(castleLevel);
    // TODO when switching level, reassign camera properties.
    game.start();
});
