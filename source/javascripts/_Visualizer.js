AudioViz.Visualizer = function(el, audioTrack) {
  this.audioTrack = audioTrack;
  this.canvasEl = $(el);
  this.canvasContext;
};

AudioViz.Visualizer.prototype.start = function() {
  this.audioTrack.analyze();
  
  this.canvasContext = this.canvasEl[0].getContext('2d');
  this.canvasEl[0].width = 500;
  this.canvasEl[0].height = 500;
  
  this.renderLoop();
};

AudioViz.Visualizer.prototype.renderLoop = function() {
  
  this.render();
  
  var that = this;
  window.requestAnimationFrame(function(){
    that.renderLoop();
  });
};

AudioViz.Visualizer.prototype.render = function() {
  
  var byteData = this.audioTrack.getSpectrum();
  
  this.canvasContext.clearRect(0, 0, 500, 500);
  
  this.canvasContext.beginPath();
  this.canvasContext.fillStyle = '#333';
  this.canvasContext.lineCap = 'round';
  this.canvasContext.fill();
  
  for(var i=0; i < this.audioTrack.analyser.frequencyBinCount; i++){
    this.canvasContext.fillRect(i,500,1,-byteData[i]*1.5);
  }
    
};