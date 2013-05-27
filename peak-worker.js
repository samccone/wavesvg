(function() {
  Float32Array.prototype.max = function() {
    var i, max, _i, _ref;

    max = -Infinity;
    for (i = _i = 0, _ref = this.length; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
      if (this[i] > max) {
        max = this[i];
      }
    }
    return max;
  };

  this.addEventListener('message', function(e) {
    var frame, i, j, peak, peaks, _i, _j, _ref, _ref1;

    frame = e.data.channels[0].length / e.data.width;
    peaks = [];
    for (i = _i = 0, _ref = e.data.width; _i <= _ref; i = _i += 1) {
      peak = 0;
      for (j = _j = 0, _ref1 = e.data.channels.length - 1; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; j = 0 <= _ref1 ? ++_j : --_j) {
        peak += e.data.channels[j].subarray(~~(i * frame), ~~((i + 1) * frame)).max();
      }
      peaks.push(peak);
    }
    return this.postMessage({
      peaks: peaks
    });
  });

}).call(this);
