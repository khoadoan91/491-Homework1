function AssetManager() {
     
    this.successCount = 0;
    this.errorCount = 0;
    this.cache = [];
    this.downloadQueue = [];
}

AssetManager.prototype.queueDownload = function (path) {
     
//    console.log("Queueing " + path);
    this.downloadQueue.push(path);
};

AssetManager.prototype.isDone = function () {
     
    return this.downloadQueue.length === this.successCount + this.errorCount;
};

AssetManager.prototype.downloadAll = function (callback) {
     
    var i, img, that, path;
    for (i = 0; i < this.downloadQueue.length; i += 1) {
        img = new Image();
        that = this;

        path = this.downloadQueue[i];
        console.log(path);

        img.addEventListener("load", function () {
//            console.log("Loaded " + this.src);
            that.successCount += 1;
            if (that.isDone()) {callback(); }
        });

        img.addEventListener("error", function () {
//            console.log("Error loading " + this.src);
            that.errorCount += 1;
            if (that.isDone()) {callback(); }
        });

        img.src = path;
        // img.setAttribute('crossOrigin', 'anonymous');
        this.cache[path] = img;
    }
};

AssetManager.prototype.getAsset = function (path) {
     
    return this.cache[path];
};
