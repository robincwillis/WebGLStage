var stage = {}

stage.models = {

wireFrameMode : true,
model 		:   "models/Clip.3dm.json",
materials   :   [],
container	:   null, 
camera 		: 	null,
scene 		: 	null,
renderer 	: 	null,
lights 		: 	[],
lightMgr	: 	null, 
stats       :   null, 
texture 	:   null, 
center 		: 	null,
controls 	:   null,
loader 		: 	null, 
radius 		:   Math.sqrt( (80^2) + (150^2)) // Trackball control variables
}

stage.controllers = {


    encode : function(txt) {
        if(typeof(btoa) === 'function'){
            return window.btoa(unescape(encodeURIComponent(txt)));
        }else{
            return Base64.encode(txt);
        }
    },

	wireFrameOn : function(obj){
       console.log(obj.geometry.materials);
        
        stage.models.wireFrameMode = true;
    },

	wireFrameOff : function(obj){
        if( !sg.scnMgr.models._wireFrameMode ){
            return;
        }

            obj.materials = [];
            
        sg.scnMgr.models._wireFrameMode = false;
    },


	mousewheel : function(event){
		event.preventDefault();
		event.stopPropagation();

		var scrollTo = event.wheelDeltaY * -1;
  		
		var dir = new THREE.Vector3().copy( stage.models.camera.position ).subSelf( stage.models.controls.target ).normalize().multiplyScalar( scrollTo / 8 );
		stage.models.camera.position.addSelf( dir );

	},

    generateTexture : function() {

        var canvas = document.createElement( 'canvas' );
        canvas.width = 256;
        canvas.height = 256;

        var context = canvas.getContext( '2d' );
        var image = context.getImageData( 0, 0, 256, 256 );

        var x = 0, y = 0;

        for ( var i = 0, j = 0, l = image.data.length; i < l; i += 4, j ++ ) {

            x = j % 256;
            y = x == 0 ? y + 1 : y;

            image.data[ i ] = 255;
            image.data[ i + 1 ] = 255;
            image.data[ i + 2 ] = 255;
            image.data[ i + 3 ] = Math.floor( x ^ y );

        }

        context.putImageData( image, 0, 0 );

        return canvas;

    },

    initMaterials : function(){

        var texture = new THREE.Texture( stage.controllers.generateTexture() );
        texture.needsUpdate = true;

        stage.models.materials.push( new THREE.MeshLambertMaterial( { map: texture, transparent: true } ) );
        stage.models.materials.push( new THREE.MeshLambertMaterial( { color: 0xdddddd, shading: THREE.FlatShading } ) );
        stage.models.materials.push( new THREE.MeshPhongMaterial( { ambient: 0x030303, color: 0xdddddd, specular: 0x009900, shininess: 30, shading: THREE.FlatShading } ) );
        stage.models.materials.push( new THREE.MeshNormalMaterial( ) );
        stage.models.materials.push( new THREE.MeshBasicMaterial( { color: 0xffaa00, transparent: true, blending: THREE.AdditiveBlending } ) );
        //stage.models.materials.push( new THREE.MeshBasicMaterial( { color: 0xff0000, blending: THREE.SubtractiveBlending } ) );

        stage.models.materials.push( new THREE.MeshLambertMaterial( { color: 0xdddddd, shading: THREE.SmoothShading } ) );
        stage.models.materials.push( new THREE.MeshPhongMaterial( { ambient: 0x030303, color: 0xdddddd, specular: 0x009900, shininess: 30, shading: THREE.SmoothShading, map: texture, transparent: true } ) );
        stage.models.materials.push( new THREE.MeshNormalMaterial( { shading: THREE.SmoothShading } ) );
        stage.models.materials.push( new THREE.MeshBasicMaterial( { color: 0xffaa00, wireframe: true } ) );

        stage.models.materials.push( new THREE.MeshDepthMaterial() );

        stage.models.materials.push( new THREE.MeshLambertMaterial( { color: 0x666666, emissive: 0xff0000, ambient: 0x000000, shading: THREE.SmoothShading } ) );
        stage.models.materials.push( new THREE.MeshPhongMaterial( { color: 0x000000, specular: 0x666666, emissive: 0xff0000, ambient: 0x000000, shininess: 10, shading: THREE.SmoothShading, opacity: 0.9, transparent: true } ) );

        stage.models.materials.push( new THREE.MeshBasicMaterial( { map: texture, transparent: true } ) );
    },

    initGrid : function(scene){
        // Grid
        var line_material = new THREE.LineBasicMaterial( { color: 0x303030 } ),
            geometry = new THREE.Geometry(),
            floor = 0, step = 25;

        for ( var i = 0; i <= 8; i ++ ) {

            geometry.vertices.push( new THREE.Vector3( - 100, floor, i * step - 100 ) );
            geometry.vertices.push( new THREE.Vector3(   100, floor, i * step - 100 ) );

            geometry.vertices.push( new THREE.Vector3( i * step - 100, floor, -100 ) );
            geometry.vertices.push( new THREE.Vector3( i * step - 100, floor,  100 ) );

        }

        var line = new THREE.Line( geometry, line_material, THREE.LinePieces );
        scene.add( line );

    },

	initModel : function(geometry, material, position){
		this.material = material;
		var m = new THREE.MeshLambertMaterial( { color: 0xdddddd, shading: THREE.FlatShading } );

		var m2 = new THREE.MeshBasicMaterial( {
                wireframe : true,
                color : 0xffaa00,
                opacity : 0.6
            });

		var materials = [m, m2];

		//THREE.GeometryUtils.center(geometry);
		
        stage.models.model = new THREE.Mesh(geometry, material);
	    stage.models.model.scale.set(0.1, 0.1, 0.1);
		stage.models.model.position = position.clone();
		stage.models.model.doubleSided = true; 
		stage.models.scene.add(stage.models.model);

        var geometry_smooth = new THREE.SphereGeometry( 1, 32, 16 );
        
        for ( var i = 0, l = geometry_smooth.faces.length; i < l; i ++ ) {
            
            var face = geometry_smooth.faces[ i ];
            face.materialIndex = 11;  
        }

        for ( var i = 0, l = stage.models.materials.length; i < l; i ++ ) {
            stage.models.materials[i].shading = THREE.SmoothShading;        
        }

        geometry_smooth.materials = stage.models.materials;

        materials.push( new THREE.MeshFaceMaterial( materials ) );
        var sphere = new THREE.Mesh( geometry_smooth, material );

        sphere.position.x = 0;
        sphere.position.y = 0;
        sphere.position.z = 0;
        console.log(stage.models.model);
		stage.controllers.wireFrameOn(stage.models.model);
        stage.models.scene.add(sphere);   
	},

	initLights : function(scene){

		var revQ = new THREE.Quaternion();
        revQ.setFromRotationMatrix( stage.models.camera.matrixWorld );
        revQ.inverse();
        var posVector = new THREE.Vector3();
        revQ.multiplyVector3( posVector.set( -50, 50, 50 ) );

        var lightpkt1 = {
            id : 1,
            type : "DIRECTIONAL",
            position : {
                x : -50,
                y : 50,
                z : 50
            },
            staticPosition : {
                x : posVector.x,
                y : posVector.y,
                z : posVector.z
            },
            followCamera : true,
            color : 0xffffff,
            intensity : 0.4
        };

        var light1 = new THREE.DirectionalLight(lightpkt1.color,1);
        light1.position.set(lightpkt1.position.x,lightpkt1.position.y,lightpkt1.position.z);
        light1.intensity = lightpkt1.intensity;
        light1.followCamera = true;
        stage.models.lights.push(light1);

        revQ.multiplyVector3( posVector.set( 25, 50, 25 ) );
        var lightpkt2 = {
            id : 2,
            type : "DIRECTIONAL",
            position : {
                x : 25,
                y : 50,
                z : 25
            },
            staticPosition : {
                x : posVector.x,
                y : posVector.y,
                z : posVector.z
            },
            followCamera : false,
            color : 0xffffff,
            intensity : 1
        };

        var light2 = new THREE.DirectionalLight(lightpkt2.color,1);
        light2.position.set(lightpkt2.position.x,lightpkt2.position.y,lightpkt2.position.z);
        light2.intensity = lightpkt2.intensity;
        stage.models.lights.push(light2);

		
		revQ.multiplyVector3( posVector.set( 0, -50, 25 ) );
        var lightpkt3 = {
            id : 3,
            type : "DIRECTIONAL",
            position : {
                x : 0,
                y : -50,
                z : 25
            },
            staticPosition : {
                x : posVector.x,
                y : posVector.y,
                z : posVector.z
            },
            followCamera : false,
            color : 0xffdfa0,
            intensity : 0.86
        };

        var light3 = new THREE.DirectionalLight(lightpkt3.color,1);
        light3.position.set(lightpkt3.position.x,lightpkt3.position.y,lightpkt3.position.z);
        light3.intensity =lightpkt3.intensity;
        stage.models.lights.push(light3);


		
		revQ.multiplyVector3( posVector.set( 0, 0, -50 ) );
        var lightpkt4 = {
            id : 4,
            type : "DIRECTIONAL",
            position : {
                x : 0,
                y : 0,
                z : -50
            },
            staticPosition : {
                x : posVector.x,
                y : posVector.y,
                z : posVector.z
            },
            followCamera : false,
            color : 0xa0baff,
            intensity : 0.55
        };

        var light4 = new THREE.DirectionalLight(lightpkt4.color,1);
        light4.position.set(lightpkt4.position.x,lightpkt4.position.y,lightpkt4.position.z);
        light4.intensity = lightpkt4.intensity;
        stage.models.lights.push(light4);


        scene.add( stage.models.lights[0] );		
		scene.add( stage.models.lights[1] );
        scene.add( stage.models.lights[2] );
        scene.add( stage.models.lights[3] );
	},

	initCamera : function(camera, scene, center){
		camera.position.x = 0;
		camera.position.y = 80;
		camera.position.z = 150;
		camera.lookAt(center);
		scene.add(camera);
	},

	initControls : function(controls){
		controls.rotateSpeed = 1.0;
		controls.zoomSpeed = 1.2;
		controls.panSpeed = 0.2;

		controls.noZoom = false;
		controls.noPan = false;

		controls.staticMoving = false;
		controls.dynamicDampingFactor = 0.3;

		controls.minDistance = stage.models.radius * 1.1;
		controls.maxDistance = stage.models.radius * 100;

		controls.keys = [ 65, 83, 68 ]; // [ rotateKey, zoomKey, panKey ]

		//controls.addEventListener( 'change', this.controllers.render );
	},

	render : function(){
		stage.models.renderer.render(stage.models.scene, stage.models.camera);
		stage.models.controls.update();
	},

	animate : function(){
		requestAnimationFrame ( stage.controllers.animate );
		stage.controllers.render();
        stage.models.stats.update();
	},

	onWindowResize : function(){
		stage.models.camera.aspect = window.innerWidth / window.innerHeight;
		stage.models.camera.updateProjectionMatrix();

		stage.models.renderer.setSize( window.innerWidth, window.innerHeight );

		//stage.models.controllers.handleResize();

		stage.controllers.render();
	},

	init : function(){

        stage.models.auth = "Basic " +  stage.controllers.encode(stage.models.sid + ":" + stage.models.token);
		
		stage.models.container = document.createElement('div');
		document.body.appendChild(stage.models.container);

		stage.models.renderer = new THREE.WebGLRenderer({clearAlpha:1, clearColor: 0xcccccc, antialias: true});
		stage.models.renderer.setSize(window.innerWidth, window.innerHeight);
		stage.models.container.appendChild(stage.models.renderer.domElement);
	
		stage.models.scene = new THREE.Scene();
		stage.models.center = new THREE.Vector3(0,0,0);
		stage.models.camera = new THREE.PerspectiveCamera (45, window.innerWidth/window.innerHeight, 1, 10000);
		stage.models.controls = new THREE.TrackballControls( stage.models.camera, stage.models.renderer.domElement);
		stage.models.material = new THREE.MeshFaceMaterial();
		stage.models.loader = new THREE.BinaryLoader( true );

		stage.controllers.initLights(stage.models.scene);
		stage.controllers.initCamera(stage.models.camera, stage.models.scene, stage.models.center);
		stage.controllers.initControls(stage.models.controls);
        stage.controllers.initMaterials();
        stage.controllers.initGrid(stage.models.scene);

		window.addEventListener('DOMMouseScroll', stage.controllers.mousewheel, false);
		window.addEventListener('mousewheel', stage.controllers.mousewheel, false);
		window.addEventListener( 'resize', stage.controllers.onWindowResize, false );
		
        stage.models.stats = new Stats();
        stage.models.stats.domElement.style.position = 'absolute';
        stage.models.stats.domElement.style.top = '0px';

        stage.models.container.appendChild( stage.models.stats.domElement );

        

		stage.models.loader.load(stage.models.model,function(geometry) {stage.controllers.initModel(geometry, stage.models.material, new THREE.Vector3(-50, 0, 0))}); 
		/* callback function to create a mesh from loaded geometry and add to scene. This function is defined later */

	}
}

stage.controllers.init();
stage.controllers.animate();

