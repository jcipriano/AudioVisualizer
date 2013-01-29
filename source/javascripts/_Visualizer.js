AudioViz.Visualizer = function(el, audioTrack, userCam) {
  this.domEl = $(el);
  this.audioTrack = audioTrack;
  this.userCam = userCam;
  
  this.height = 500;
  this.width = 500;
  this.resolution = 32;
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
  var mirrorMaterial = new THREE.MeshBasicMaterial({ envMap: this.cubeCamera.renderTarget });
    
	this.group = new THREE.Object3D();
	this.scene.add(this.group);

  this.sphereMesh = new THREE.Mesh(new THREE.SphereGeometry(20, 60, 40), mirrorMaterial);
	this.group.add(this.sphereMesh);
  
	var angle = (Math.PI * 2) / (this.resolution * 2);
  for(var i = 0; i < this.resolution * 2; i++){
	  //var mesh = new THREE.Mesh(new THREE.SphereGeometry(10, 60, 40), mirrorMaterial);
    var mesh = new THREE.Mesh(new THREE.CubeGeometry(5, 5, 5), mirrorMaterial);
    mesh.angle = (i * angle) - (Math.PI / 2);
    mesh.position.x = Math.cos(mesh.angle) * 40;
    mesh.position.y = Math.sin(mesh.angle) * 40;
    mesh.position.z = 0;
		mesh.rotation.z = mesh.angle
    this.mirroredMeshes.push(mesh);
	  this.group.add(mesh);
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
  var mod = this.audioTrack.analyser.frequencyBinCount / this.resolution; 
  var v = 0;
  var newByteData = [];
  for(var i=0; i < this.audioTrack.analyser.frequencyBinCount; i++){
    if(i%mod != 0){
      v = v + byteData[i]
    }else{
      newByteData.push( (v/mod) / 256 );
      v = 0;
    }
  }
  
  var scale;
  var mesh;
  var that = this;
  var value;
  var totalAvg = 0;
	$.each(newByteData, function(i, value){
    value = newByteData[i];
    totalAvg = totalAvg + value;
    mesh = that.mirroredMeshes[i];
    mesh.visible = false;
    mesh.scale.x = mesh.scale.y = mesh.scale.z = value > 0 ? 0.5 + value * 2 : 1;
      
    mesh = that.mirroredMeshes[that.resolution * 2 - i - 1];
    mesh.visible = false;
    mesh.scale.x = mesh.scale.y = mesh.scale.z = value > 0 ? 0.5 + value * 2 : 1;
	});
  
  this.sphereMesh.visible = false;
  
  this.sphereMesh.scale.x = this.sphereMesh.scale.y = this.sphereMesh.scale.z = 1 + (totalAvg / this.resolution);
  
	this.cubeCamera.updateCubeMap( this.renderer, this.scene );
  
  this.sphereMesh.visible = true;
  
	$.each(this.mirroredMeshes, function(i, mesh){
    mesh.visible = true;
	});
  
  this.group.rotation.x = this.group.rotation.x + 0.005;
  this.group.rotation.y = this.group.rotation.y + 0.005;
  //this.group.rotation.z = this.group.rotation.z + 0.015;
  
  this.renderer.render(this.scene, this.camera);
};

AudioViz.Visualizer.prototype.onWindowResized = function( event ) {
	this.renderer.setSize( window.innerWidth, window.innerHeight );
	this.camera.projectionMatrix.makePerspective( 50, window.innerWidth / window.innerHeight, 1, 1100 );
}