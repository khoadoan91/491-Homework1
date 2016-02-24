var AM = new AssetManager();

AM.queueDownload("./img/knight/knight jump.png");
AM.queueDownload("./img/knight/knight jump flipped.png");
AM.queueDownload("./img/knight/knight run.png");
AM.queueDownload("./img/knight/knight run flipped.png");
AM.queueDownload("./img/knight/knight standing.png");
AM.queueDownload("./img/knight/knight standing flipped.png");
AM.queueDownload("./img/knight/knight attack.png");
AM.queueDownload("./img/knight/knight attack flipped.png");
// AM.queueDownload("./img/knight/knight hit draft.png");
// AM.queueDownload("./img/knight/knight hit draft flipped.png");

AM.queueDownload("./img/forest-stage/forest ground block.png");
AM.queueDownload("./img/forest-stage/tree outer door.png");
AM.queueDownload("./img/forest-stage/tree tile.png");
// AM.queueDownload("./img/forest-stage/tree tile inner.png");
AM.queueDownload("./img/forest-stage/forest sky.png");
AM.queueDownload("./img/forest-stage/forest trees.png");

AM.queueDownload("./img/enemy/chaser.png");
AM.queueDownload("./img/enemy/archer.png");
AM.queueDownload("./img/enemy/wisp.png");
AM.queueDownload("./img/enemy/death anim.png");

// AM.queueStageDownload("./txt/forest-stage.txt");

/*
Download all the elements and add entities to the game.
*/
AM.downloadAll(function () {
    console.log("Initializing world");
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');

//     var simpleLevelPlan = [
// "|                                                                     |             |",
// "|                                                                     |             |",
// "|                                                                     |             |",
// "|                                                                     |             |",
// "|                                       !                             |             |",
// "|                                   xxxxxxxxxxxxxxxx   xxxx     xxxx  |             |",
// "|                         !             |1100000000|                  |             |",
// "|                        xxx  xx        |0000000000|       xx         |    &        |",
// "|                          |            |0000000000|              xxxx|             |",
// "|                    *     |      xxx   |000000xxxx|                  |             |",
// "|                    xxx   |            |0000000000|         xxx                    |",
// "|                          |    *       |xxx0000000|              *                 D",
// "|                          |   xx       |0000000000|              xxxxxxxxxxxxxxxxxx|",
// "|                        xx|            |0000000000|                  |             |",
// "|                          |       xx   |000000xxxx|                  |             |",
// "|            x             |            |0000000000|          xxxx    |             |",
// "|    @       |      xxx    |            D2200000000|                  |             |",
// "|           x|      | |  xx|xxxxxxxxxxxx|xxxxxxxxxx|xxxxxxxxxxxxxxxxxx|             |",
// "|xxx     xxx |     x   xx                                                           |",
// "|   xxxxx    |xxxxxx                                                                |"
//     ];

    var game = new GameEngine(ctx);
    var forestStage = new Level();

    var map = [
"                                    |                                                |",
"                                    |                                                |",
"                                    |                                                |",
"                                    |                                                |",
"                                    |                                                |",
"                                    |                                                |",
"                                    |                                                |",
"                                    |                 !               !              |",
"                                    |      xxxxxxx   xxxx  xxxx      xxx             |",
"                                    |        |                              xxxx     |",
"                                    |xxx     |                                       |",
"                                    |        |                                       |",
"                                    | *                  *   xxx        xxx          |",
"                                    |xxx                xxx       xxx        xx      |",
"                                    |                   x                            |",
"                                    |      xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx       |",
"                                    |        |                                     * |",
"                                    |   x    |                                    xxx|",
"                                    |   xx   |                                       |",
"                                    |   xx   |                                       |",
"                                    |   xx   |         *        w        *           |",
"                                    |x  xxx  |x  |xx  xxxxxxxxxxxxxx   xxxxxx    xxxx|",
"                                    |        |   |                                   |",
"                                    |      ! |   |                             !     |",
"                                    |      xx|   |                            xx     |",
"                                    |        |   |    !          !            xx    o|",
"                                    |      ! |   |xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx|",
"                     x                   xxxx|               |B                      |",
"                      x                      |               |                       |",
"                       x            *       o|o                                      |",
"               w        x        xxxxxxxxxxxxxxxxxxxxxxxxx                           |",
"              xxx               w|                       |                           |",
"              | |              xxx                       |xxxx                       |",
"         xx   | |       !      |                             |                       |",
"              | |xxxxxxxxxxxxxxx                             |                       |",
"              |                                              |                       |",
"@    x     !! |                                              |                       |",
"xxxxx|xxxxxxxxx                                              |                       |",
"                                                             |                      EF",
"                                                             |xxxxxxxxxxxxxxxxxxxxxxx|",
    ];
    // forestStage.parseLevelFile(AM.getAsset("./txt/forest-stage.txt").split("\n"), game);
    forestStage.parseLevelFile(map, game);
    forestStage.addBackground(AM.getAsset("./img/forest-stage/forest sky.png"));
    forestStage.addBackground(AM.getAsset("./img/forest-stage/forest trees.png"), true, true, 3/4);
    var camera = new Camera(0, 0, canvas.width, canvas.height, forestStage.width_px, forestStage.height_px);
    camera.follow(forestStage.player, canvas.width/2 - 120, canvas.height/2 - 120);
    game.init(camera);
    game.addEntity(forestStage);
    game.addPlayer(forestStage.player);
    for (var i = 0; i < forestStage.enemies.length; i += 1) {
        game.addEntity(forestStage.enemies[i]);
    }
    game.start();
});
