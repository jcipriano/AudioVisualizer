var AudioViz = {};

AudioViz.App = function() {
  this.analyzer;
  this.visualizer;
  this.userCam;
  this.audioTrack;
};

AudioViz.App.prototype.init = function() {
  console.log('AudioViz.App.prototype.init');
  
  this.audioTrack = new AudioViz.AudioTrack();
  this.audioTrack.loop = true;
  this.audioTrack.autoPlay = true;
  
  this.audioTrack.events.add(AudioViz.Events.LOADED, this.audioLoaded, this);
  this.audioTrack.load('audio/music.mp3');
};

AudioViz.App.prototype.audioLoaded = function() {
  console.log('AudioViz.App.prototype.audioLoaded');

  //this.userCam = new AudioViz.UserCamera($('#webcam-view')[0]);
  //this.userCam.events.add(AudioViz.Events.SUCCESS, this.camEnabled, this);
  //this.userCam.start();

  this.audioTrack.analyze();
  this.visualizer = new AudioViz.Visualizer('#canvas-holder', this.audioTrack, this.userCam);
  this.visualizer.start();
};

AudioViz.App.prototype.camEnabled = function() {
  console.log('AudioViz.App.prototype.camEnabled');
};


$(function(){
  app = new AudioViz.App();
  app.init();
});