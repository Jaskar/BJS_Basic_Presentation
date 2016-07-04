// Une fois la page et les script chargés, on peut lancer notre script.
window.addEventListener('DOMContentLoaded', function() {

    // On récupère notre canvas, appelé "affichage"
    var canvas = document.getElementById('affichage');

    // On démarre le moteur 3D, en lui donnant le canvas
    // comme paramètre (et l'antialising)
    //http://i30.photobucket.com/albums/c313/bpd86cm1/Anti-Aliasing.jpg
    var engine = new BABYLON.Engine(canvas, true);
    engine.loadingUIBackgroundColor = "Black";

    /************ STUDIO DE CINÉMA ************/

    // Puis, on créé une scène
    var scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3.FromInts(150,150,255);    // Couleur de fond

    // Une fois la scène créé, nous devons créer une caméra,
    // afin de pouvoir retransmettre ce qu'elle voit
    // dans le canvas.
    // Il existe différent types de caméras

    // Free
    //var camera = new BABYLON.FreeCamera(
    //    "camera_free",
    //    new BABYLON.Vector3(10, 50, -60),
    //    scene
    //);
    //camera.setTarget(BABYLON.Vector3.Zero());

    // ArcRotate
    var camera = new BABYLON.ArcRotateCamera(
        "camera_rotate",        // Nom
        0.2, 0.9, 80,           // Alpha, beta, radius (http://urbanproductions.com/wingy/babylon/misc/arc01.jpg)
        BABYLON.Vector3.Zero(), // Target (cible)
        scene
    );

    // Prenons ensuite le contrôle de la caméra!
    // Sans pouvoir en faire n'importe quoi ...
    camera.attachControl(canvas, true);
    camera.upperBetaLimit = Math.PI/2 - 0.1;

    // Un petit truc à voir pour le début
    //var cube = new BABYLON.Mesh.CreateBox(
    //    "monCube",  // Nom
    //    5,          // Taille
    //    scene       // Scene
    //);

    // Et allumons la lumière
    var light = new BABYLON.HemisphericLight(
        "light",                        // Nom
        new BABYLON.Vector3(0.5, 1, 0), // Direction
        scene                           // Scene
    );
    light.intensity = 0.9;              // Intensité


    // On s'adapte à l'écran de notre public
    window.addEventListener('resize', function() {
        engine.resize();
    });


    /***************** DECOR *****************/

    // Le terrain
    var ground = BABYLON.Mesh.CreateGround(
        "sol",  // Nom
        500,    // TailleX
        500,    // TailleZ
        1,      // Tiles
        scene   // Scene
    );

    // Personnalisé, pour plus de réalisme -
    // (matériaux, éclairage, textures)
    var groundMaterial =
        new BABYLON.StandardMaterial("groundMaterial", scene);

    groundMaterial.diffuseTexture =
        new BABYLON.Texture('assets/ground.png', scene);
    groundMaterial.diffuseTexture.uScale = 10;
    groundMaterial.diffuseTexture.vScale = 10;

    // Pour paraitre plus vert
    groundMaterial.diffuseColor = new BABYLON.Color3.FromInts(100,200,100);
    // Pour ne pas réfléchir la source de lumière
    groundMaterial.specularColor = BABYLON.Color3.Black();

    ground.material = groundMaterial;


    // Les maisons
    var houses = [];

    for(var i = -1; i < 2; i++) {
        var house = BABYLON.Mesh.CreateBox(
            "maison",
            1,
            scene
        );
        house.scaling = new BABYLON.Vector3(2,1.5,4);
        house.position.x = -5 + i * 5;
        house.position.y = 0.75;
        house.position.z = 20 + i * 1.5;

        houses.push(house);
    }

    // La mine
    var mine = BABYLON.Mesh.CreateCylinder( // Ctrl+clic / doc
        "mine", // Name
        10,     // Height
        6,      // Diameter top
        3,      // Diameter bottom
        32,     // Tesselation
        1,      // Subdivisions
        scene   // Scene
    );
    mine.position = new BABYLON.Vector3(0,0, -20);
    mine.rotation.x = Math.PI/2;


    // Et nos péons

    var LeonLePeon = new Worker(scene);
    LeonLePeon.moveTo(new BABYLON.Vector3(-5, 0, 20));

    var GastonLePeon = new Worker(scene);
    GastonLePeon.moveTo(new BABYLON.Vector3(-5, 0, 2));

    var RobinsonLePeon = new Worker(scene);
    RobinsonLePeon.moveTo(new BABYLON.Vector3(10, 0, 5));

    var peons = [];
    peons.push(LeonLePeon);
    peons.push(GastonLePeon);
    peons.push(RobinsonLePeon);

    for(var i = 0; i < 3; i++) {
        peons[i].setWarehouse(houses[i]);
        peons[i].setWorkplace(mine);
    }



    // Assets manager - Chargement des modèles 3D
    var assetsManager = new BABYLON.AssetsManager(scene);

    assetsManager.onTaskError = function (task) {
        console.log("Erreur lors du chargement du modèle 3D.");
    };
    assetsManager.onFinish = function (tasks) {
        // Et on démarre le tournage de notre scène !
        engine.runRenderLoop(function() {

            // On récupère le temps qui s'écoule entre chaque rendu
            var deltaTime = engine.getDeltaTime();

            peons.forEach(function(peon) {
                peon.update(deltaTime);
            });

            scene.render();
        });
    };

    var coinLoadingTask = assetsManager.addMeshTask(
        "Coin", "", "./", "assets/Coin.babylon");
    //var coinLoadingTask = assetsManager.addMeshTask
    //    ("Coin", "", "./", "assets/Coin.obj");

    coinLoadingTask.onSuccess = function (task) {
        task.loadedMeshes[0].name = "Coin";
        task.loadedMeshes[0].isVisible = false;

        // Coin.babylon
        task.loadedMeshes[0].scaling = new BABYLON.Vector3(0.8,0.8,0.8);

        // Coin.obj
        //task.loadedMeshes[0].scaling = new BABYLON.Vector3(0.035,0.035,0.035);
        //task.loadedMeshes[0].rotation.x = Math.PI/2;
    };

    assetsManager.load();
});