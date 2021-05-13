import * as THREE from '/js/three/three.module.js';
import { GLTFLoader } from '/js/three/jsm/GLTFLoader.js';
import { FBXLoader } from '/js/three/jsm/FBXLoader.js';
import { RGBELoader } from '/js/three/jsm/RGBELoader.js';
import { OrbitControls } from '/js/three/jsm/OrbitControls.js';
import { LoadingBar } from '/js/LoadingBar.js';
import { vector3ToString } from '/js/DebugUtils.js';

class App{
	constructor(){
		const container = document.createElement( 'div' );
		document.body.appendChild( container );
        
		this.camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 100 );
		this.camera.position.set( 0, 4, 14 );
        
		this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color( 0xaaaaaa );

		const ambient = new THREE.HemisphereLight(0xffffff, 0x666666, 0.3);
		this.scene.add(ambient);
        
        const light = new THREE.DirectionalLight();
        light.position.set( 0.2, 1, 1.5);
        this.scene.add(light);
			
		this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true } );
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.physicallyCorrectLights = true;
        this.setEnvironment();
		container.appendChild( this.renderer.domElement );
		
        //Add code here
        
        
        this.controls = new OrbitControls( this.camera, this.renderer.domElement );
        this.controls.target.set(0, 3.5, 0);
        this.controls.update();
        
        window.addEventListener('resize', this.resize.bind(this) );
	}	
    
    /*setEnvironment(){
        const loader = new RGBELoader().setDataType( THREE.UnsignedByteType );
        const pmremGenerator = new THREE.PMREMGenerator( this.renderer );
        pmremGenerator.compileEquirectangularShader();
        
        const self = this;
        
        loader.load( '/HDR/venice_sunset_1k.hdr', ( texture ) => {
          const envMap = pmremGenerator.fromEquirectangular( texture ).texture;
          pmremGenerator.dispose();

          self.scene.environment = envMap;

        }, undefined, (err)=>{
            console.error( 'An error occurred setting the environment');
        } );
    }*/
    
    loadGLTF(){
        const self = this;
        const loader = new GLTFLoader().setPath('/models/')

        loader.load(
            'office-chair.glb',
            function(gltf){
                self.chair = gltf.scene;
                self.scene.add(gltf.scene);
                self.LoadingBar.visible = false;
                self.renderer.setAnimationLoop(self.render.bind(self));                
            },
            function(xhr){
                    self.LoadingBar.progress = xhr.loaded/xhr.total;
            },
            function(err){
                console.log('An error happened');
            }
        );
    }
    
    loadFBX(){
    }
    
    resize(){
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize( window.innerWidth, window.innerHeight );  
    }
    
	render( ) {   
        this.chair.rotateY( 0.01 );
        this.renderer.render( this.scene, this.camera );
    }
}

export { App };