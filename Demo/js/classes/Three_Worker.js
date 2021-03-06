// CONSTRUCTOR

function Worker(scene) {

    this._scene = scene;

    this.mesh = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshLambertMaterial()
    );
    scene.add(this.mesh);

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

    // Cration d'une instance de la pi�ce
    var coin = new THREE.Mesh(
        this._scene.getObjectByName("Coin").children[0].geometry,
        this._scene.getObjectByName("Coin").children[0].material
    );

    // On la rend visible et on la positionne au bon endroit
    coin.visible = true;
    coin.scale.set(0.035,0.035,0.035);
    coin.rotateX(Math.PI/2);
    coin.position.set(
        this.mesh.position.x,
        this.mesh.position.y + 3,
        this.mesh.position.z
    );
    coin.position.x += Math.random() * 2 - 1;
    coin.position.z += Math.random() * 4 - 2;
    this._scene.add(coin);

    // On l'anime vers le haut en rotation sur elle-m�me
    new TWEEN.Tween( coin.position )
        .to(
        {
            y:  coin.position.y + 6
        },
        1250
    )
        .easing( TWEEN.Easing.Linear.None)
        .start();
    new TWEEN.Tween( coin.rotation )
        .to(
            {
                z:  coin.rotation.z + Math.PI*2
            },
            1250
        )
        .easing( TWEEN.Easing.Linear.None)
        .start();

    var _this = this;
    // Au bout de quelques ms on la supprime
    window.setTimeout(function() {
        _this._scene.remove(coin);
    }, 1250);
};

// Jump to position in param
Worker.prototype.moveTo = function(point) {
    this.mesh.position.x = point.x;
    this.mesh.position.y = point.y;
    this.mesh.position.z = point.z;
    this.mesh.position.y = 0.5;
};
// Move ahead to position
Worker.prototype.moveStepTo = function(targetPoint, step) {

    this.mesh.lookAt(targetPoint.position);
    //this.mesh.rotation.x = 0;

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
        var moveDirection = new THREE.Vector3(
            targetPoint.position.x - this.mesh.position.x,
            0,
            targetPoint.position.z - this.mesh.position.z
        ).normalize();

        moveDirection.x *= step;
        moveDirection.y *= step;
        moveDirection.z *= step;

        this.mesh.position.x += moveDirection.x;
        this.mesh.position.z += moveDirection.z;
    }
    return false;
};

// Update function
Worker.prototype.update = function(deltaTime) {

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
    else if(this._loadingBag <= 0) {

        if(this.moveStepTo(this._workplace, this.speed * deltaTime))
            this._isLoading = true;
    }
    // If he have loading, go to the warehouse
    else if(this._loadingBag > 0) {

        if(this.moveStepTo(this._warehouse, this.speed * deltaTime))
            this._isUnloading = true;
    }
};