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
      if (args.buffer == null) {
        throw "you must pass an audio buffer";
      }
      if (args.maxHeight == null) {
        throw "you must pass a max height";
      }
      args.appendTo = args.appendTo || document.body;
      args.width = args.width || (args.pixelsPerSecond != null ? args.pixelsPerSecond * args.buffer.duration : window.innerWidth);
      this.config = args;
      this.draw();
    }

    waveSvg.prototype.draw = function() {
      var h, i, max, peak, peaks, rect, w, y, _i, _len;

      this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      peaks = this.getPeaks(this.config.buffer);
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
      return this.config.appendTo.appendChild(this.svg);
    };

    waveSvg.prototype.getPeaks = function(buffer) {
      var channel, frame, i, j, peak, peaks, _i, _j, _ref, _ref1;

      frame = buffer.getChannelData(0).length / this.config.width;
      peaks = [];
      channel = null;
      for (i = _i = 0, _ref = this.config.width; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        peak = 0;
        for (j = _j = 0, _ref1 = buffer.numberOfChannels - 1; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; j = 0 <= _ref1 ? ++_j : --_j) {
          channel = buffer.getChannelData(j);
          peak += channel.subarray(i * frame, (i + 1) * frame).max();
        }
        peaks.push(peak);
      }
      return peaks;
    };

    return waveSvg;

  })();

  this.streamSvg = (function() {
    function streamSvg(args) {
      this.appendWaveForm = __bind(this.appendWaveForm, this);      if (args.stream == null) {
        throw "you must pass a stream";
      }
      if (args.maxHeight == null) {
        throw "you must pass a max height";
      }
      if (args.max == null) {
        throw "you must pass a max";
      }
      if (args.pixelsPerSecond == null) {
        throw "you must pass pixelsPerSecond";
      }
      args.appendTo = args.appendTo || document.body;
      this.context = new webkitAudioContext;
      this.streamSource = this.context.createMediaStreamSource(args.stream);
      this.processor = this.context.createScriptProcessor(2048, 1, 1);
      this.config = args;
      this.step = 0;
      this.processor.onaudioprocess = this.appendWaveForm;
      this.streamSource.connect(this.processor);
      this.processor.connect(this.context.destination);
      this.constructSvg();
    }

    streamSvg.prototype.constructSvg = function() {
      this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      this.svg.setAttribute('height', this.config.maxHeight);
      return this.config.appendTo.appendChild(this.svg);
    };

    streamSvg.prototype.getPeaks = function(buffer) {
      var channel, frame, i, j, peak, peaks, width, _i, _j, _ref, _ref1;

      width = ~~(this.config.pixelsPerSecond * buffer.duration);
      frame = buffer.getChannelData(0).length / width;
      peaks = [];
      channel = null;
      for (i = _i = 0, _ref = width - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        peak = 0;
        for (j = _j = 0, _ref1 = buffer.numberOfChannels - 1; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; j = 0 <= _ref1 ? ++_j : --_j) {
          channel = buffer.getChannelData(j);
          peak += channel.subarray(i * frame, (i + 1) * frame).max();
        }
        peaks.push(peak);
      }
      return peaks;
    };

    streamSvg.prototype.appendWaveForm = function(d) {
      var max,
        _this = this;

      max = this.config.max;
      return this.getPeaks(d.inputBuffer).forEach(function(peak) {
        var h, rect, y;

        rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        h = Math.abs(~~(peak * (_this.config.maxHeight / max)));
        y = ~~((_this.config.maxHeight - h) / 2);
        rect.setAttribute("x", _this.step++);
        rect.setAttribute("width", 1);
        rect.setAttribute("height", h);
        rect.setAttribute("y", y);
        return _this.svg.appendChild(rect);
      });
    };

    return streamSvg;

  })();

}).call(this);
