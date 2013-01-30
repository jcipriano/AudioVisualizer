AudioViz.Visualizer = function(el, audioTrack, userCam) {
  this.domEl = $(el);
  this.audioTrack = audioTrack;
  this.userCam = userCam;
  
  this.height = 500;
  this.width = 500;
  this.resolution = 32;
  
	this.lon = 0;
	this.lat = 0;
	this.phi = 0;
  
  this.cameraDistance = 150;
};

AudioViz.Visualizer.prototype.start = function() {
  this.create3DEnv();
};

AudioViz.Visualizer.prototype.create3DEnv = function() {
  
  // camera
	this.camera = new THREE.PerspectiveCamera( 60, this.width / this.height, 1, 100000 );
	this.camera.position.z = this.cameraDistance ;
  
  // scene
  this.scene = new THREE.Scene();
  
  // renderer
  this.renderer = new THREE.WebGLRenderer( { antialias: true } );
  this.renderer.setSize(this.width, this.height);
  this.domEl.append(this.renderer.domElement);
	
  // light
  var light = new THREE.PointLight( 0xFFFFFF, 1, 0 );
  light.position.set( 0, 0, 25 );
  this.scene.add( light );
  
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

  this.sphereMesh = new THREE.Mesh(new THREE.SphereGeometry(20, 60, 40), mirrorMaterial);
	this.scene.add(this.sphereMesh);
  
  // spectrum
  this.group = new THREE.Object3D();
	this.scene.add(this.group);
  
	var angle = (Math.PI * 2) / (this.resolution * 2);
  for(var i = 0; i < this.resolution * 2; i++){
    var mesh = new THREE.Mesh(new THREE.CubeGeometry(5, 5, 5), mirrorMaterial );
    mesh.angle = (i * angle) - (Math.PI / 2);
    mesh.position.x = Math.cos(mesh.angle) * 40;
    mesh.position.y = Math.sin(mesh.angle) * 40;
    mesh.position.z = 0;
		mesh.rotation.z = mesh.angle
    this.mirroredMeshes.push(mesh);
	  this.group.add(mesh);
  }
  
  // window resize
  var that = this;
  window.addEventListener('resize', function(e){
	  that.onWindowResized(e);
  }, false );
	this.onWindowResized(null);
  
  // redner
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
  
  this.updateToAudio();
  
  // move camera
  this.lon += 0.1;
  this.lat = Math.max(-85, Math.min(85, this.lat));
	this.phi = THREE.Math.degToRad(90 - this.lat);
	this.theta = THREE.Math.degToRad(this.lon);
  
	this.camera.position.x = this.cameraDistance * Math.sin(this.phi) * Math.cos(this.theta);
	this.camera.position.y = this.cameraDistance * Math.cos(this.phi);
	this.camera.position.z = this.cameraDistance * Math.sin(this.phi) * Math.sin(this.theta);
  this.camera.lookAt(this.scene.position);
  
  // move group
  this.group.rotation.y = this.group.rotation.y + 0.005;
  this.group.rotation.x = this.group.rotation.x + 0.005;

  // update reflection
  this.sphereMesh.visible = false; // off
	this.cubeCamera.updateCubeMap( this.renderer, this.scene );
  this.sphereMesh.visible = true; // on
  
  // render
  this.renderer.render(this.scene, this.camera);
};

AudioViz.Visualizer.prototype.updateToAudio = function() {

  // get byte data
  var byteData = this.audioTrack.getSpectrum();
  
  // apply resolution
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
  
  // scale mesh's
  var scale;
  var mesh;
  var that = this;
  var value;
  var totalAvg = 0;
	$.each(newByteData, function(i, value){
    value = newByteData[i];
    totalAvg = totalAvg + value;
    
    mesh = that.mirroredMeshes[i];
    mesh.scale.x = mesh.scale.y = mesh.scale.z = value > 0 ? 0.5 + value * 2 : 1;
      
    mesh = that.mirroredMeshes[that.resolution * 2 - i - 1];
    mesh.scale.x = mesh.scale.y = mesh.scale.z = value > 0 ? 0.5 + value * 2 : 1;
	});
    
  // scale center mesh
  this.sphereMesh.scale.x = this.sphereMesh.scale.y = this.sphereMesh.scale.z = 1 + (totalAvg / this.resolution);
};

AudioViz.Visualizer.prototype.onWindowResized = function( event ) {
	this.renderer.setSize( window.innerWidth, window.innerHeight );
	this.camera.projectionMatrix.makePerspective( 50, window.innerWidth / window.innerHeight, 1, 1100 );
}