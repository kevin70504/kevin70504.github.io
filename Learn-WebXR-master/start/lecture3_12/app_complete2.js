import * as THREE from '../../libs/three/three.module.js';
import { GLTFLoader } from '../../libs/three/jsm/GLTFLoader.js';
import { RGBELoader } from '../../libs/three/jsm/RGBELoader.js';
import { ARButton } from '../../libs/ARButton.js';
import { ARButton2 } from '../../libs/ARButton2.js';
import { Button } from '../../libs/Button.js';
import { LoadingBar } from '../../libs/LoadingBar.js';
import { Player } from '../../libs/Player.js';
import { FontLoader} from '../../libs/FontLoader.js';


class App{
	constructor(){

		const container = document.createElement( 'div' );
		document.body.appendChild( container );
        
        this.clock = new THREE.Clock();
        
        this.loadingBar = new LoadingBar();

		this.assetsPath = '../../assets/';
        
		this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 20 );
		this.camera.position.set( 0, 1.6, 3 );
        
		this.scene = new THREE.Scene();

		const ambient = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 2);
        ambient.position.set( 0.5, 1, 0.25 );
		this.scene.add(ambient);
        
        const light = new THREE.DirectionalLight();
        light.position.set( 0.2, 1, 1);
        this.scene.add(light);
			
		this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserverDrawingBuffer: true } );
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize( window.innerWidth, window.innerHeight );
		this.renderer.outputEncoding = THREE.sRGBEncoding;
		container.appendChild( this.renderer.domElement );

        this.setEnvironment();               
        
        this.workingVec3 = new THREE.Vector3();
        
        this.initScene();
        this.setupXR();
		
		window.addEventListener('resize', this.resize.bind(this));
        
	}
    
    setEnvironment(){
        const loader = new RGBELoader().setDataType( THREE.UnsignedByteType );
        const pmremGenerator = new THREE.PMREMGenerator( this.renderer );
        pmremGenerator.compileEquirectangularShader();
        
        const self = this;
        
        loader.load( '../../assets/hdr/venice_sunset_1k.hdr', ( texture ) => {
          const envMap = pmremGenerator.fromEquirectangular( texture ).texture;
          pmremGenerator.dispose();

          self.scene.environment = envMap;

        }, undefined, (err)=>{
            console.error( 'An error occurred setting the environment');
        } );
    }
	
    resize(){ 
        this.camera.aspect = window.innerWidth / window.innerHeight;
    	this.camera.updateProjectionMatrix();
    	this.renderer.setSize( window.innerWidth, window.innerHeight );
    }

    arPlane(){
        const self = this;

        if (self.reticle.visible){
        
            self.mesh.matrixAutoUpdate = true;
            self.workingVec3.setFromMatrixPosition( self.reticle.matrix );
            self.mesh.position.setFromMatrixPosition( self.reticle.matrix );
            self.mesh.visible = true;

        }       
    }
    
    loadKnight(){
	    const loader = new GLTFLoader().setPath(this.assetsPath);
		const self = this;
		
		// Load a GLTF resource
		loader.load(
			// resource URL
			`knight2.glb`,
			// called when the resource is loaded
			function ( gltf ) {
				const object = gltf.scene.children[5];
				
				const options = {
					object: object,
					speed: 0.5,
					assetsPath: self.assetsPath,
					loader: loader,
                    animations: gltf.animations,
					clip: gltf.animations[0],
					app: self,
					name: 'knight',
					npc: false
				};
				
				self.knight = new Player(options);
                self.knight.object.visible = false;
				
				self.knight.action = 'Dance';
				const scale = 0.005;
				self.knight.object.scale.set(scale, scale, scale); 
				
                self.loadingBar.visible = false;
                self.renderer.setAnimationLoop( self.render.bind(self) );//(timestamp, frame) => { self.render(timestamp, frame); } );
			},
			// called while loading is progressing
			function ( xhr ) {

				self.loadingBar.progress = (xhr.loaded / xhr.total);

			},
			// called when loading has errors
			function ( error ) {

				console.log( 'An error happened' );

			}
		);
	}		
    

    takeScreenshot(){
        this.renderer.render( this.scene, this.camera );
        this.renderer.domElement.toBlob(function(blob){
        var a = document.createElement('a');
        var url = URL.createObjectURL(blob);
        a.href = url;
        a.download = 'canvas.png';
        a.click();
        }, 'image/png', 1.0);
    }

    initScene(){

        let textmesh ;
        let message;

        const planewidth = prompt("???????????????");
        const planelength = prompt("???????????????");

        const planepivxa_w = -(planewidth*0.5);
        const planepivxa_l = planelength*0.5;



        if(planewidth > planelength){
            message = "This use "+planewidth*7+" tiles";          
        }
        else if(planewidth == planelength){
            message = "This use "+planewidth*14+" tiles";
        }
        else if(planewidth < planelength){
            message = "This use "+planelength*7+" tiles";
        }

        // 0.5 5

        //*2.9 */
        // 1 14.5


        const self = this;
        const loader = new THREE.TextureLoader();
        const texture2 = loader.load(
        "../../assets/texture/marble_01_diff_1k.jpg",
        function(texture2){
            texture2.wrapS = texture2.wrapT = THREE.RepeatWrapping;
            texture2.offset.set(0,0);
            texture2.repeat.set(planewidth,planelength);
        },
        function(err){
            console.log("An error happened");
        });
    
        this.reticle = new THREE.Mesh(
            //new THREE.RingBufferGeometry( 0.15, 0.2, 32 ).rotateX( - Math.PI / 2 ),  //???????????????????????????
            new THREE.RingBufferGeometry( 0.045, 0.05, 32 ).rotateX( - Math.PI / 2 ),
            new THREE.MeshBasicMaterial() //???????????????????????????
        );
        //this.reticle.position.set(0,-1,0);
        this.reticle.matrixAutoUpdate = false;  //???????????????????????????????????????????????????
        this.reticle.visible = false; // ???????????????????????????
        this.scene.add( this.reticle ); //???????????????????????????
        
        this.group = new THREE.Group();
        this.group.position.set(0,0,0);
        this.group.visible = false;
        this.scene.add(this.group);

        this.geometry = new THREE.PlaneBufferGeometry( planewidth,planelength).rotateX( - Math.PI / 2 );  //????????????????????? ???1 ???1 ??????1
        this.material = new THREE.MeshBasicMaterial( {map: texture2} );
        this.mesh = new THREE.Mesh( this.geometry,this.material);
        this.mesh.matrixAutoUpdate = false;
        //this.mesh.position.set(-1,0,1); //??????2
        this.mesh.position.set(planepivxa_w,0,planepivxa_l)
        this.mesh.visible = false;
        this.group.add(this.mesh);

     
        //this.meshes = [];
        
        this.loadKnight();
        
        const btnshow = document.querySelector("#Show");
        btnshow.addEventListener("click", function(){

            alert(message);

        });

        /*const btn2 = document.createElement("button");
        btn2.innerHTML = "Submit";
        btn2.type = "submit";
        btn2.name = "formBtn";
        document.body.appendChild(btn2);       
        btn2.addEventListener("click",function(){
        alert("????????????"+self.planewidth*12+"?????????");
        });*/


        /*let fontloader = new THREE.FontLoader();
        fontloader.load("../../assets/fonts/roboto/Roboto-msdf.json",function(font){

            let xMid;
            let shapes = font.generateShapes( "Sample Test", 100, 2 );
            let textshape = new THREE.BufferGeometry();
            let geomety = new THREE.ShapeGeometry(shapes);
            geomety.computeBoundingBox();

            let material = new THREE.MeshBasicMaterial({color:0x0000ff,side: THREE.DoubleSide});

            xMid = -0.5 * ( geometry.boundingBox.max.x - geometry.boundingBox.min.x );
            geomety.translate(xMid,0,0);

            textshape.formGeometry(geomety);
            let textMesh = new THREE.Mesh(textshape,material);
            textMesh.position.set(0,0,0);
            self.scene.add(textMesh);
        });*/
        
        const fontloader = new FontLoader();
        fontloader.load( '../../assets/fonts/helvetiker_regular.typeface.json', function ( font ) {
        const color = 0x006699;
        const matDark = new THREE.LineBasicMaterial( {
            color: color,
            side: THREE.DoubleSide
        } );
        const matLite = new THREE.MeshBasicMaterial( {
            color: color,
            transparent: true,
            opacity: 0.4,
            side: THREE.DoubleSide
        } );
        const message3 = "This use tiles";
        //const message2 = "This use "+ message +" tiles";
        const shapes = font.generateShapes( message, 0.05 );

        const geometry = new THREE.ShapeGeometry( shapes );
        geometry.computeBoundingBox();
        const xMid = - 0.5 * ( geometry.boundingBox.max.x - geometry.boundingBox.min.x );
        geometry.translate( xMid, 0, 0 );
        // make shape ( N.B. edge view not visible )
        textmesh = new THREE.Mesh( geometry, matLite );
        textmesh.position.set(0,0,0);
        self.group.add(textmesh);
        } );
        
        console.log(this.group);


    }
    
    setupXR(){
        this.renderer.xr.enabled = true;

        let options = {
            requiredFeatures: [ 'hit-test' ],
            optionalFeatures: [ 'dom-overlay' ],
        }

        options.domOverlay = {root: document.getElementById("content")};
        //options.domOverlay = {root: document.getElementById("planeDiv")};
        document.body.appendChild(ARButton2.createButton(this.renderer,options));
        
        const btntake = document.querySelector("#take");
        btntake.addEventListener("click",function(){

            /*self.renderer.render( self.scene, self.camera );
            self.renderer.domElement.toBlob(function(blob){
            var a = document.createElement('a');
            var url = URL.createObjectURL(blob);
            a.href = url;
            a.download = 'canvas.png';
            a.click();
            }, 'image/png', 1.0);*/

            // open in new window like this
            var w = window.open('', '');
            w.document.title = "Screenshot";
            //w.document.body.style.backgroundColor = "red";
            var img = new Image();
            var secondImg = new Image();
                self.renderer.render(self.scene, self.camera);
                var doubleImageCanvas = document.getElementById('doubleImage');
                var context = doubleImageCanvas.getContext('2d');
                var sources = {
                    firstImage: self.renderer.domElement.toDataURL("image/png"),
                    secondImage: arToolkitContext.arController.canvas.toDataURL("image/png")
                };
        
                loadImages(sources, function(images){
                    context.drawImage(images.secondImage, 0, 0);
                    context.drawImage(images.firstImage, 0, 0);
                    img.src = doubleImageCanvas.toDataURL("image/png");
                    w.document.body.appendChild(img);
                });
                
                function loadImages(sources, callback) {
                    var images = {};
                    var loadedImages = 0;
                    var numImages = 0;
                    // get num of sources
                    for (var src in sources) {
                        numImages++;
                    }
                    for (var src in sources) {
                        images[src] = new Image();
                        images[src].onload = function () {
                            if (++loadedImages >= numImages) {
                                callback(images);
                            }
                        };
                        images[src].src = sources[src];
                    }
                }
        });


        //const btn = new ARButton( this.renderer, { sessionInit: { requiredFeatures: [ 'hit-test' ], optionalFeatures: [ 'dom-overlay' ], domOverlay: { root: document.body } } } );
        //const btn2 = new Button( this.renderer, { sessionInit: {optionalFeatures: [ 'dom-overlay' ], domOverlay: { root: document.body } } } );       
        const self = this;
        let controller;

        this.hitTestSourceRequested = false;
        this.hitTestSource = null;
        
        function onSelect() {

            if (self.reticle.visible){
                
                    self.mesh.matrixAutoUpdate = true;
                    //self.workingVec3.setFromMatrixPosition( self.reticle.matrix );
                    //self.mesh.position.setFromMatrixPosition( self.reticle.matrix );
                    self.mesh.visible = true;

                    self.group.position.setFromMatrixPosition( self.reticle.matrix );
                    self.group.visible = true;

                    const worldposition2 = new THREE.Vector3();
                    self.reticle.getWorldPosition(worldposition2);
                    console.log("??????????????????",worldposition2);
        
            }
        }

        this.controller = this.renderer.xr.getController( 0 );
        this.controller.addEventListener( 'select', onSelect );
        
        this.scene.add( this.controller );    
    }
    
    requestHitTestSource(){

        //??????????????????
        const self = this;
        
        const session = this.renderer.xr.getSession(); //????????????session ????????????

        session.requestReferenceSpace( 'viewer' ).then( function ( referenceSpace ) {  //???????????????????????????
            
            session.requestHitTestSource( { space: referenceSpace } ).then(  //????????????????????????
                function ( source ) {

                self.hitTestSource = source;

            } );

        } );

        session.addEventListener( 'end', function () { //???????????????????????????????????????????????????????????????

            self.hitTestSourceRequested = false;
            self.hitTestSource = null;
            self.referenceSpace = null;

        } );

        this.hitTestSourceRequested = true;

    }
    
    getHitTestResults( frame ){

        //????????????????????????
        const hitTestResults = frame.getHitTestResults( this.hitTestSource ); //????????????hitTestResults????????????????????????

        if ( hitTestResults.length ) {  //?????????????????????0?????????
            
            const referenceSpace = this.renderer.xr.getReferenceSpace();
            const hit = hitTestResults[ 0 ]; //????????????hit ???????????????????????????
            const pose = hit.getPose( referenceSpace ); //????????????pose??????????????????

            
            this.reticle.visible = true;
            this.reticle.matrix.fromArray( pose.transform.matrix );

        } else {

            this.reticle.visible = false;

        }

    }

    render( timestamp, frame ) {
        const dt = this.clock.getDelta();
        //if (this.knight) this.knight.update(dt);

        const self = this;
        
        if ( frame ) {

            if ( this.hitTestSourceRequested === false ) this.requestHitTestSource( ) //??????Frame ???????????????????????????false,??????????????????

            if ( this.hitTestSource ) this.getHitTestResults( frame ); //????????????????????????????????????

        }

        this.renderer.render( this.scene, this.camera );        
        /*if (this.knight.calculatedPath && this.knight.calculatedPath.length>0){
            console.log( `path:${this.knight.calculatedPath[0].x.toFixed(2)}, ${this.knight.calculatedPath[0].y.toFixed(2)}, ${this.knight.calculatedPath[0].z.toFixed(2)} position: ${this.knight.object.position.x.toFixed(2)}, ${this.knight.object.position.y.toFixed(2)}, ${this.knight.object.position.z.toFixed(2)}`);
        }*/
    }
}

export { App };
