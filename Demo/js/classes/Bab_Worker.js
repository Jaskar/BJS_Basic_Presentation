// CONSTRUCTOR

function Worker(scene) {

    this._scene = scene;

    this.mesh = BABYLON.Mesh.CreateBox(
        "worker", 1, scene
    );

    this.speed = 5;

    this._warehouse;
    this._workplace;

    this._isLoading = false;
    this._setLoading = null;
    this._loadingTime = 1000;
    this._loadingHit = 10;
    this._loadingBag = 0;
    this._loadingBagMax = 60;

    this._isUnloading = false;
    this._setUnloading = null;
    this._unloadingTime = 250;
    this._unloadingHit = 15;
};

// GET / SET

Worker.prototype.setWarehouse = function(warehouse) {
    this._warehouse = warehouse;
};
Worker.prototype.setWorkplace = function(workplace) {
    this._workplace = workplace;
};

// FUNCTIONS

// Create coin anim
Worker.prototype.createCoin = function() {

    // Cration d'une instance de la pièce
    var coin = this._scene.getMeshByName("Coin").createInstance("Coin_Anim");

    // On la rend visible et on la positionne au bon endroit
    coin.isVisible = true;
    coin.position = this.mesh.position.clone();
    coin.position.x += Math.random() * 2 - 1;
    coin.position.z += Math.random() * 4 - 2;

    // On l'anime vers le haut en rotation sur elle-même
    BABYLON.Animation.CreateAndStartAnimation(
        "elevation",
        coin,
        "position.y",
        60,
        90,
        coin.position.y,
        10,
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
    );
    BABYLON.Animation.CreateAndStartAnimation(
        "rotation",
        coin,
        "rotation.y",
        60,
        90,
        coin.rotation.y,
        coin.rotation.y + Math.PI *2,
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
    );

    // Au bout de quelques ms on la supprime
    window.setTimeout(function() {
        coin.dispose();
    }, 1250);
};

// Jump to position in param
Worker.prototype.moveTo = function(point) {
    this.mesh.position = point;
    this.mesh.position.y = 0.5;
};
// Move ahead to position
Worker.prototype.moveStepTo = function(targetPoint, step) {

    this.mesh.lookAt(targetPoint.position);
    this.mesh.rotation.x = 0;

    var distance = Math.sqrt(
        Math.pow(( targetPoint.position.x - this.mesh.position.x ),2) +
        Math.pow(( targetPoint.position.z - this.mesh.position.z ),2)
    );

    if(distance <= step) {
        this.mesh.position = targetPoint.position.clone();
        this.mesh.position.y = 0.5;
        return true;
    }
    else {
        var moveDirection = new BABYLON.Vector3(
            targetPoint.position.x - this.mesh.position.x,
            0,
            targetPoint.position.z - this.mesh.position.z
        ).normalize();

        moveDirection.scaleInPlace(step);

        this.mesh.position.x += moveDirection.x;
        this.mesh.position.z += moveDirection.z;
    }
    return false;
};

// Update function
Worker.prototype.update = function(deltaTime) {
    deltaTime /= 1000;

    // If he is loading
    if(this._isLoading) {
        var _this = this;

        if(!this._setLoading) {
            this._setLoading = function () {
                window.setTimeout(function () {
                    _this._loadingBag += _this._loadingHit;
                    _this.createCoin();

                    if (_this._loadingBag >= _this._loadingBagMax) {
                        _this._loadingBag = _this._loadingBagMax;
                        _this._isLoading = false;
                        _this._setLoading = null;
                    }
                    else {
                        _this._setLoading();
                    }

                }, _this._loadingTime);
            };

            this._setLoading();
        }
    }
    // If he is unloading
    else if(this._isUnloading) {
        var _this = this;

        if(!this._setUnloading) {
            this._setUnloading = function () {
                window.setTimeout(function () {
                    _this._loadingBag -= _this._unloadingHit;
                    _this.createCoin();

                    if (_this._loadingBag <= 0) {
                        _this._loadingBag = 0;
                        _this._isUnloading = false;
                        _this._setUnloading = null;
                    }
                    else {
                        _this._setUnloading();
                    }

                }, _this._unloadingTime);
            };

            this._setUnloading();
        }
    }
    // If he don't have loading, go to the mine
    else if(this._loadingBag == 0) {

        if(this.moveStepTo(this._workplace, this.speed * deltaTime))
            this._isLoading = true;
    }
    // If he have loading, go to the warehouse
    else if(this._loadingBag > 0) {

        if(this.moveStepTo(this._warehouse, this.speed * deltaTime))
            this._isUnloading = true;
    }
};