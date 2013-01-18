AudioViz.AudioTrack = function() {
  this.audioContext;
  this.source;
  this.analyser;
  this.gainNode;
  this.jsNode;
  this.autoPlay;
  this.loop;
  this.channelData = [];
  this.events = new AudioViz.EventPublisher();
};

AudioViz.AudioTrack.prototype.load = function(url) {
  console.log('AudioViz.AudioTrack.prototype.load: ', url);
  this.audioContext = new window.webkitAudioContext();
  
  var that = this;
  var request = new XMLHttpRequest();
  request.open("GET", url, true);
  request.responseType = "arraybuffer";
  request.onload = function() { 
    that.onload(request.response);
  }
  request.send();
};

AudioViz.AudioTrack.prototype.onload = function(response) {
  console.log('AudioViz.AudioTrack.prototype.onload: ', response);
  
  var that = this;
  this.audioContext.decodeAudioData(response, function(buffer) {
    that.ondecode(buffer);
  }, function(){ });
};

AudioViz.AudioTrack.prototype.ondecode = function(buffer) {
  console.log('AudioViz.AudioTrack.prototype.ondecode: ', buffer);

  this.source = this.audioContext.createBufferSource();
  this.source.buffer = buffer;

  this.gainNode = this.audioContext.createGainNode();
  this.source.connect(this.gainNode);
  this.gainNode.connect(this.audioContext.destination)
  
  if(this.autoPlay){
    this.play();
  }
  
  this.events.publish(AudioViz.Events.LOADED);
};

AudioViz.AudioTrack.prototype.play = function(callback) {
  console.log('AudioViz.AudioTrack.prototype.play');
  this.source.loop = this.loop;
  this.source.noteOn(0);
  
  this.events.publish(AudioViz.Events.PLAY);
};

AudioViz.AudioTrack.prototype.stop = function(callback) {
  console.log('AudioViz.AudioTrack.prototype.stop');
  this.source.noteOff(0);
  
  this.events.publish(AudioViz.Events.STOP);
};

AudioViz.AudioTrack.prototype.analyze = function() {
  this.analyser = this.audioContext.createAnalyser();
  this.source.connect(this.analyser);
  this.analyser.connect(this.audioContext.destination);
};

AudioViz.AudioTrack.prototype.getSpectrum = function() {
  var freqByteData = new Uint8Array(this.analyser.frequencyBinCount);
  this.analyser.getByteFrequencyData(freqByteData);
  
  return freqByteData;
};

