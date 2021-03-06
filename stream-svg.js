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

  this.streamSvg = (function() {
    function streamSvg(args) {
      this.onstream = __bind(this.onstream, this);      if (args.maxHeight == null) {
        throw "you must pass a max height";
      }
      if (args.max == null) {
        throw "you must pass a max";
      }
      if (args.pixelsPerSecond == null) {
        throw "you must pass pixelsPerSecond";
      }
      args.appendTo = args.appendTo || document.body;
      this.config = args;
      this.step = 0;
      this.deviation = 0;
      if (args.stream) {
        this.streamProcessor(args.stream);
      } else {
        args.onstream = this.appendWaveForm;
      }
      this.constructSvg();
    }

    streamSvg.prototype.streamProcessor = function(stream) {
      var context, processor, streamSource;

      context = new webkitAudioContext;
      streamSource = context.createMediaStreamSource(stream);
      processor = context.createScriptProcessor(2048, 1, 1);
      processor.onaudioprocess = this.onstream;
      streamSource.connect(processor);
      return processor.connect(context.destination);
    };

    streamSvg.prototype.constructSvg = function() {
      this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      this.svg.setAttribute('height', this.config.maxHeight);
      return this.config.appendTo.appendChild(this.svg);
    };

    streamSvg.prototype.getPeaks = function(buffer) {
      var actualWidth, channel, frame, i, j, peak, peaks, width, _i, _j, _ref, _ref1;

      actualWidth = this.config.pixelsPerSecond * buffer.duration;
      width = Math.ceil(actualWidth);
      this.deviation += width - actualWidth;
      frame = buffer.getChannelData(0).length / width;
      peaks = [];
      if (this.deviation >= 1) {
        width -= --this.deviation;
      }
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

    streamSvg.prototype.onstream = function(d) {
      var max,
        _this = this;

      max = this.config.max;
      d = d.inputBuffer || d;
      this.getPeaks(d).forEach(function(peak) {
        var h, rect, y;

        rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        h = Math.abs(Math.ceil(peak * (_this.config.maxHeight / max)));
        y = ~~((_this.config.maxHeight - h) / 2);
        rect.setAttribute("x", _this.step++);
        rect.setAttribute("width", 1);
        rect.setAttribute("height", h);
        rect.setAttribute("y", y);
        return _this.svg.appendChild(rect);
      });
      return this.svg.setAttribute('width', this.step);
    };

    return streamSvg;

  })();

}).call(this);
