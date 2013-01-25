AudioViz.UserCamera = function(videoEl) {
  
  console.log(videoEl);
  
	this.video = videoEl;
	this.video.width = 800;
	this.video.height = 600;
	this.video.autoplay = true;
	this.video.loop = true;
  
  this.events = new AudioViz.EventPublisher();
};

AudioViz.UserCamera.prototype.start = function() {
  
  console.log('AudioViz.UserCamera.prototype.start');
  
	var that = this;
	navigator.webkitGetUserMedia({ video: true, audio: false },
    function(stream) {
      that.video.src = window.webkitURL.createObjectURL(stream);
      that.events.publish(AudioViz.Events.SUCCESS, stream);
	  },
    function(error) {
      that.events.publish(AudioViz.Events.FAILURE, error);
    }
  );
};