//This should eventually be moved into the data for an individual level
//Perhaps these could be passed in to levels as we make them and then we can call <StageVar>.playBGM() ?
//One area of concern is that the way these currently loaded in to the page. It's probably embedded music in the page queueing and finishing that causes the burst of slowdown.
//I don't mind the magic numbers so much here, since I think they're only used here and they have particular timestamps, but we could make them globals if enough people hate them.
var BGM = {
   forestLevel : new Howl({
        urls: ['./snd/bloody_tears.mp3'],
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
    })
};

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
AM.queueDownload("./img/forest-stage/tree outer door.png");
AM.queueDownload("./img/forest-stage/tree tile.png");
AM.queueDownload("./img/forest-stage/forest sky.png");
AM.queueDownload("./img/forest-stage/forest trees.png");

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
    var forestLevel = new Level(game, BGM.forestLevel);

    var map = [
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
"                       x            *       o|o              I                       |      ",
"               w        x        xxxxxxxxxxxxxxxxxxxxxxxxx   I                       |      ",
"              xxx               w|                       |   I                       |      ",
"              | |              xxx                       |xxxx                       |    xx",
"         xx   | |       !      |                             |                       |      ",
"              | |xxxxxxxxxxxxxxx                             |                       |      ",
"              |                                              |                       |      ",
"@    x     !! |                                              |                       |xx    ",
"xxxxx|xxxxxxxxx                                              |                       F      ",
"                                                             |                      EF      ",
"                                                             |xxxxxxxxxxxxxxxxxxxxxxx|xxxxxx",
    ];
    // forestLevel.parseLevelFile(AM.getAsset("./txt/forest-stage.txt").split("\n"), game);
    forestLevel.parseLevelFile(map);
    forestLevel.addBackground(AM.getAsset("./img/forest-stage/forest sky.png"));
    forestLevel.addBackground(AM.getAsset("./img/forest-stage/forest trees.png"), true, true, 3/4);
    forestLevel.addTitleScreen(AM.getAsset("./img/other/title screen.png"));
    forestLevel.addVictoryScreen(AM.getAsset("./img/other/victory screen.png"))
    var camera = new Camera(0, 0, canvas.width, canvas.height, forestLevel.width_px, forestLevel.height_px);
    camera.follow(forestLevel.player, canvas.width/2 - 120, canvas.height/2 - 120);
    game.init(camera);
    game.addLevel(forestLevel);
    game.start();
});
