import * as THREE from '../../libs/three/three.module.js';
import { OrbitControls } from '../../libs/three/jsm/OrbitControls.js';
import { Stats } from '../../libs/stats.module.js';
import { ARButton } from '../../libs/ARButton.js';

class App{
	constructor(){
		const container = document.createElement( 'div' );
		document.body.appendChild( container );
        
        this.clock = new THREE.Clock();
        
		this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 20 );
		
		this.scene = new THREE.Scene();
        
		this.scene.add( new THREE.HemisphereLight( 0x606060, 0x404040 ) );

        const light = new THREE.DirectionalLight( 0xffffff );
        light.position.set( 1, 1, 1 ).normalize();
		this.scene.add( light );
			
		this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true } );
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        
		container.appendChild( this.renderer.domElement );
        
        this.controls = new OrbitControls( this.camera, this.renderer.domElement );
        this.controls.target.set(0, 3.5, 0);
        this.controls.update();
        
        this.stats = new Stats();
        document.body.appendChild( this.stats.dom );
        
        this.initScene();
        this.setupXR();
        
        window.addEventListener('resize', this.resize.bind(this) );
	}	
    
    initScene() {
        this.geometry = new THREE.SphereGeometry(0.03, 0.03, 0.1); //創建圓柱體Geometry
        this.meshes = [];
    }
    
    setupXR() {
        this.renderer.xr.enabled = true;
        const self = this;
        let controller;

        function onSelect() {
            //隨機顏色的方塊

            const material = new THREE.MeshPhongMaterial({ color: 0xffffff * Math.random() }); //隨機生成顏色
            const mesh = new THREE.Mesh(self.geometry, material);
            mesh.position.set(0, 0, -0.3).applyMatrix4(controller.matrixWorld); //四維陣列
            mesh.quaternion.setFromRotationMatrix(controller.matrixWorld); //四元數，連續旋轉向量計算
            self.scene.add(mesh);
            self.meshes.push(mesh);
        }

        const btn = new ARButton(this.renderer);

        controller = this.renderer.xr.getController(0);
        controller.addEventListener("select", onSelect);
        this.scene.add(controller);

        this.renderer.setAnimationLoop(this.render.bind(this));

    }

    
    resize(){
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize( window.innerWidth, window.innerHeight );  
    }
    
	render( ) {   
        this.stats.update();
        this.meshes.forEach( (mesh) => { mesh.rotateY( 0.01 ); });
        this.renderer.render( this.scene, this.camera );
    }
}

export { App };