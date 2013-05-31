(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  this.waveSvg = (function() {
    function waveSvg(args) {
      if (args == null) {
        args = {};
      }
      this.drawPeaks = __bind(this.drawPeaks, this);
      this.config = args;
      if (this.config.buffer == null) {
        throw "you must pass an audio buffer";
      }
      if (this.config.maxHeight == null) {
        throw "you must pass a max height";
      }
      this.config.appendTo = this.config.appendTo || document.body;
      this.config.width = this.config.width || (this.config.pixelsPerSecond != null ? this.config.pixelsPerSecond * this.config.buffer.duration : window.innerWidth);
      this.config.downSample = this.config.downSample || 16;
      this.config.shrunkBuffer = this.shrinkBuffer(this.config.buffer, this.config.downSample);
      this.worker = new Worker(this.config.workerPath || "peak-worker.js");
      this.worker.onmessage = this.drawPeaks;
      this.draw();
    }

    waveSvg.prototype.updateMaxScalar = function(max) {
      this.config.max = max;
      this.removeSvg();
      return this.draw();
    };

    waveSvg.prototype.updateDownSampleRate = function(rate) {
      this.config.shrunkBuffer = this.shrinkBuffer(this.config.buffer, rate);
      this.removeSvg();
      return this.draw();
    };

    waveSvg.prototype.shrinkBuffer = function(b, downSample) {
      var cd, i, j, step, toReturn, _i, _j, _ref, _ref1;

      toReturn = [];
      for (i = _i = 0, _ref = b.numberOfChannels - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        step = 0;
        cd = b.getChannelData(i);
        toReturn.push(new Float32Array(~~(cd.length / downSample)));
        for (j = _j = 0, _ref1 = toReturn[i].length - 1; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; j = 0 <= _ref1 ? ++_j : --_j) {
          toReturn[i][step++] = cd[j * downSample];
        }
      }
      return toReturn;
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
      var channels;

      channels = [];
      return this.worker.postMessage({
        length: this.config.shrunkBuffer[0].length,
        channels: this.config.shrunkBuffer,
        width: this.config.width
      });
    };

    return waveSvg;

  })();

}).call(this);
