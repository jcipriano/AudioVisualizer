var AudioViz = {};

AudioViz.App = function() {
  this.analyzer;
  this.visualizer;
  this.audioTrack;
};

AudioViz.App.prototype.init = function() {
  console.log('AudioViz.App.prototype.init');
  
  this.audioTrack = new AudioViz.AudioTrack();
  this.audioTrack.loop = true;
  this.audioTrack.autoPlay = true;
  
  this.audioTrack.events.add(AudioViz.Events.LOADED, this.audioLoaded, this);
  this.audioTrack.load('/audio/music.mp3');
};

AudioViz.App.prototype.audioLoaded = function() {
  console.log('AudioViz.App.prototype.audioLoaded');
    
  this.visualizer = new AudioViz.Visualizer('#main-canvas', this.audioTrack);
  this.visualizer.start();
};


$(function(){
  app = new AudioViz.App();
  app.init();
});