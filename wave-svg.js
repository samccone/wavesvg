(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

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

  this.waveSvg = (function() {
    function waveSvg(args) {
      if (args == null) {
        args = {};
      }
      this.drawPeaks = __bind(this.drawPeaks, this);
      if (args.buffer == null) {
        throw "you must pass an audio buffer";
      }
      if (args.maxHeight == null) {
        throw "you must pass a max height";
      }
      args.appendTo = args.appendTo || document.body;
      args.width = args.width || (args.pixelsPerSecond != null ? args.pixelsPerSecond * args.buffer.duration : window.innerWidth);
      this.worker = new Worker(args.workerPath || "peak-worker.js");
      this.worker.onmessage = this.drawPeaks;
      this.config = args;
      this.draw();
    }

    waveSvg.prototype.updateMaxScalar = function(max) {
      this.config.max = max;
      this.removeSvg();
      return this.draw();
    };

    waveSvg.prototype.updatePixelsPerSecond = function(amount) {
      this.config.pixelsPerSecond = amount;
      this.config.width = this.config.pixelsPerSecond * this.config.buffer.duration;
      this.removeSvg();
      return this.draw();
    };

    waveSvg.prototype.removeSvg = function() {
      return this.config.appendTo.removeChild(this.svg);
    };

    waveSvg.prototype.drawPeaks = function(e) {
      var h, i, max, peak, peaks, rect, w, y, _i, _len;

      peaks = e.data.peaks;
      this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      this.svg.innerHTML = "";
      max = this.config.max || Math.max.apply(Math, peaks);
      for (i = _i = 0, _len = peaks.length; _i < _len; i = ++_i) {
        peak = peaks[i];
        w = i;
        h = Math.abs(~~(peak * (this.config.maxHeight / max)));
        y = ~~((this.config.maxHeight - h) / 2);
        rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("x", i);
        rect.setAttribute("width", 1);
        rect.setAttribute("height", h);
        rect.setAttribute("y", y);
        this.svg.appendChild(rect);
      }
      this.svg.setAttribute('height', this.config.maxHeight);
      this.svg.setAttribute('width', this.config.width);
      this.config.appendTo.appendChild(this.svg);
      return typeof console !== "undefined" && console !== null ? typeof console.warn === "function" ? console.warn("drawn in " + ((new Date().getTime() - this.startTime) / 1000) + " sec") : void 0 : void 0;
    };

    waveSvg.prototype.draw = function() {
      this.startTime = new Date().getTime();
      return this.getPeaks();
    };

    waveSvg.prototype.getPeaks = function() {
      var channels, i, _i, _ref;

      channels = [];
      for (i = _i = 0, _ref = this.config.buffer.numberOfChannels - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        channels.push(Float32Array.prototype.subarray.apply(this.config.buffer.getChannelData(i)));
      }
      return this.worker.postMessage({
        length: this.config.buffer.getChannelData(0).length,
        channels: channels,
        width: this.config.width
      });
    };

    return waveSvg;

  })();

}).call(this);
