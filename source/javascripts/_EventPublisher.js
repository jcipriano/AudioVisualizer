AudioViz.Events = {
  PLAY: 'play',
  STOP: 'play',
  PROCESSED: 'processed',
  LOADED: 'loaded'
};

AudioViz.EventPublisher = function() {
  this.events = { };
};

AudioViz.EventPublisher.prototype.publish = function(event, data) {
  var i, scope, callback, callbacks, _results;
    
  if (this.events && this.events[event]) {
    callbacks = this.events[event];
      
    i = 0;
    _results = [];
    while (i < callbacks.length) {
      scope = callbacks[i].obj;
      callback = callbacks[i].func;
      callback.apply(scope ? scope : this, [data]);
      _results.push(i++);
    }
      
    return _results;
  }
};

AudioViz.EventPublisher.prototype.add = function(event, callback, scope) {
  if (!this.events[event]){
    this.events[event] = [];
  }
    
  return this.events[event].push({ func: callback, obj: scope });
};
  
AudioViz.EventPublisher.prototype.remove = function(event, callback) {
  var index, callbacks;
    
  if (this.events && this.events[event]) {
    callback = this.events[event];
    index = callbacks.indexOf(callback);
    return callbacks.splice(index, 1);
  }
};