AudioViz.Visualizer = function(el, audioTrack, userCam) {
  this.domEl = $(el);
  this.audioTrack = audioTrack;
  this.userCam = userCam;
  
  this.height = 500;
  this.width = 500;
};

AudioViz.Visualizer.prototype.start = function() {
  this.create3DEnv();
};

AudioViz.Visualizer.prototype.create3DEnv = function() {
  
  // camera
  this.scene = new THREE.Scene();
	this.camera = new THREE.PerspectiveCamera( 60, this.width / this.height, 1, 100000 );
	this.camera.position.z = 200;
  
  // renderer
  this.renderer = new THREE.WebGLRenderer();
  this.renderer.setSize(this.width, this.height);
	this.renderer.autoClear = false;
  this.domEl.append(this.renderer.domElement);
	
  // skybox
	var textureCube = THREE.ImageUtils.loadTextureCube([
    '/images/skybox/posx.jpg',
    '/images/skybox/negx.jpg',
    '/images/skybox/posy.jpg',
    '/images/skybox/negy.jpg',
    '/images/skybox/posz.jpg',
    '/images/skybox/negz.jpg'
  ]);
	var shader = THREE.ShaderLib['cube'];
	shader.uniforms['tCube'].value = textureCube;

	var skyBoxMaterial = new THREE.ShaderMaterial({
		fragmentShader: shader.fragmentShader,
		vertexShader: shader.vertexShader,
		uniforms: shader.uniforms,
		depthWrite: false,
		side: THREE.BackSide
	});
  
  this.cube = new THREE.Mesh(new THREE.CubeGeometry(500, 500, 500), skyBoxMaterial);
	this.scene.add(this.cube);
  
  // mirror camera
	this.cubeCamera = new THREE.CubeCamera(1, 1000, 256);
	this.cubeCamera.renderTarget.minFilter = THREE.LinearMipMapLinearFilter;
	this.scene.add(this.cubeCamera);
  
  // sphere and material
  this.mirroredMeshes = [];
  var sphereMaterial = new THREE.MeshBasicMaterial({ envMap: this.cubeCamera.renderTarget });
    
	this.group = new THREE.Object3D();
	this.scene.add(this.group);

	var angle = (Math.PI * 2) / 64;
  for(var i = 0; i < 64; i++){
	  var sphere = new THREE.Mesh(new THREE.SphereGeometry(10, 60, 40), sphereMaterial);
    sphere.angle = (i * angle) - (Math.PI / 2);
    sphere.position.x = Math.cos(sphere.angle) * 75;
    sphere.position.y = Math.sin(sphere.angle) * 75;
    sphere.position.z = 0;
    this.mirroredMeshes.push(sphere);
	  this.group.add(sphere);
  }
  
  // light
  var pointLight = new THREE.PointLight(0xFFFFFF);
	pointLight.position.z = 3200;
  this.scene.add(pointLight);
  
  var that = this;
  window.addEventListener('resize', function(e){
	  that.onWindowResized(e);
  }, false );
  
	this.onWindowResized(null);
  
  this.renderLoop();
}

AudioViz.Visualizer.prototype.renderLoop = function() {
  
  this.render();
  
  var that = this;
  window.requestAnimationFrame(function(){
    that.renderLoop();
  });
};

AudioViz.Visualizer.prototype.render = function() {
  
  
  var byteData = this.audioTrack.getSpectrum();
  var resolution = 128;
  var mod = this.audioTrack.analyser.frequencyBinCount / resolution; 
  var v = 0;
  var newByteData = [];
  for(var i=0; i < this.audioTrack.analyser.frequencyBinCount; i++){
    if(i%mod != 0){
      v = v + byteData[i]
    }else{
      newByteData.push( (v/mod) / 64 );
      v = 0;
    }
  }
  
  var scale;
	$.each(this.mirroredMeshes, function(i, sphere){
    if(byteData[500] > 0) {
      sphere.scale.x = sphere.scale.y = sphere.scale.z = newByteData[i] + 0.05;
    }
    sphere.visible = false;
	});
  
	this.cubeCamera.updateCubeMap( this.renderer, this.scene );
  
	$.each(this.mirroredMeshes, function(i, sphere){
    sphere.visible = true;
	});
  
  this.group.rotation.y = this.group.rotation.y + 0.001;
  this.group.rotation.z = this.group.rotation.z + 0.01;
  
  this.renderer.render(this.scene, this.camera);
};

AudioViz.Visualizer.prototype.onWindowResized = function( event ) {
	this.renderer.setSize( window.innerWidth, window.innerHeight );
	this.camera.projectionMatrix.makePerspective( 70, window.innerWidth / window.innerHeight, 1, 1100 );
}