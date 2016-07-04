// Une fois la page et les script chargés, on peut lancer notre script.
window.addEventListener('DOMContentLoaded', function() {

    // On démarre le moteur 3D  (en lui donnant un paramètre antialising)
    var renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setClearColor(0x9696ff);   // Couleur de fond

    // On définit la taille
    var width = window.innerWidth;
    var height = window.innerHeight;
    renderer.setSize(width, height);

    // On l'applique dans le corps de notre page
    document.body.appendChild(renderer.domElement);


    // On démarre un objet qui va nous servir à charger des éléments
    var loadingManager = new THREE.LoadingManager();

    // Puis, on créé une scène
    var scene = new THREE.Scene;

    // On crée la caméra
    var camera = new THREE.PerspectiveCamera(
        45,             // FOV
        width / height, // Ratio
        0.1,            // Near
        100000          // Far
    );
    camera.position.y = 23;
    camera.position.x = -31;
    camera.position.z = 6;
    camera.lookAt(new THREE.Vector3(0,0,0));

    // Prenons ensuite le contrôle de la caméra!
    var orbitControls = new THREE.OrbitControls( camera, renderer.domElement );
    orbitControls.maxPolarAngle = Math.PI / 2 - 0.1;
    scene.add(camera);

    // Et allumons la lumière
    var light = new THREE.HemisphereLight(
        0xffffff,   // Ground color
        0x050530,   // Sky color
        1.5         // Intensity
    );
    light.position.set(1, 0, 1).normalize();    // Direction
    scene.add(light);



    /***************** DECOR *****************/

    // Le terrain
    var groundGeometry = new THREE.PlaneBufferGeometry(500, 500, 10, 10);

    // Personnalisé, pour plus de réalisme - (matériaux, éclairage, textures)
    //var imageLoader = new THREE.ImageLoader( loadingManager );
    //imageLoader.load( "assets/ground.png", function ( image ) {
    //
    //    texture.image = image;
    //    texture.needsUpdate = true;
    //
    //} );
    var groundTexture = new THREE.ImageUtils.loadTexture("assets/ground.png");
    groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set(10,10);
    var groundMaterial = new THREE.MeshLambertMaterial({map: groundTexture});

    var ground = new THREE.Mesh(
        groundGeometry,
        groundMaterial
    );
    ground.rotateX(-Math.PI/2);
    scene.add(ground);


    var standardMat = new THREE.MeshLambertMaterial();

    // Les maisons
    var houses = [];

    for(var i = -1; i < 2; i++) {

        var house = new THREE.Mesh(
            new THREE.CubeGeometry(1, 1, 1),
            standardMat
        );

        house.scale.set(2,1.5,4);
        house.position.x = 5 + i * 5;
        house.position.y = 0.75;
        house.position.z = 21.5 - i * 1.5;

        houses.push(house);
        scene.add(house);
    }


    // La mine
    var mine = new THREE.Mesh(
        new THREE.CylinderGeometry(
            3,      // Radius top
            1.5,    // Radius bottom
            10,     // Height
            32,     // Radial segments
            1       // Height segments
        ),
        standardMat
    );
    mine.position.set(0,0,-20);
    mine.rotateX(Math.PI/2);
    scene.add(mine);


    // Et nos péons

    var LeonLePeon = new Worker(scene);
    LeonLePeon.moveTo(new THREE.Vector3(0, 0, 23));

    var GastonLePeon = new Worker(scene);
    GastonLePeon.moveTo(new THREE.Vector3(5, 0, 2));

    var RobinsonLePeon = new Worker(scene);
    RobinsonLePeon.moveTo(new THREE.Vector3(15, 0, 5));

    var peons = [];
    peons.push(LeonLePeon);
    peons.push(GastonLePeon);
    peons.push(RobinsonLePeon);

    for(var i = 0; i < 3; i++) {
        peons[i].setWarehouse(houses[i]);
        peons[i].setWorkplace(mine);
    }


    var objLoader = new THREE.OBJLoader( loadingManager );
    objLoader.load( "assets/Coin.obj", function ( object ) {
        object.name = "Coin";
        object.visible = false;
        object.scale.set(0.05,0.05,0.05);
        object.rotateX(Math.PI/2);
        scene.add(object);
    },
    function() {},
    function() {
        console.log("Error while loading \"Coin.obj\"");
    });


    // Une horloge pour récupérer le temps qui s'écoule entre chaque rendu
    var clock = new THREE.Clock();
    var render = function () {
        requestAnimationFrame( render );
        orbitControls.update();

        var deltaTime = clock.getDelta();

        peons.forEach(function(peon) {
            peon.update(deltaTime);
        });

        renderer.render(scene, camera);
    };
    render();
});