!(function() {

  Float32Array.prototype.max = function(){
    var max = -Infinity, len = this.length, i = 0;
    for ( ; i < len; i++ )
      if ( this[i] > max )
        max = this[i];
    return max;
  };

  function draw(args){
    var peaks = getPeaks(args.buffer, args.width || window.innerWidth)
      , max   = Math.max.apply(Math, peaks)
      , svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");

    peaks.forEach(function(peak, index){
      var w     = index;
      var h     = ~~(peak * ( args.maxHeight / max ));
      var y     = ~~((args.maxHeight - h ) / 2);
      rect  = document.createElementNS("http://www.w3.org/2000/svg", "rect")
      rect.setAttribute("x", index);
      rect.setAttribute("width", 1);
      rect.setAttribute("height", h);
      rect.setAttribute("y", y);
      svg.appendChild(rect);
    });

    args.appendTo.appendChild(svg);
  }

  function getPeaks( buffer , width){
    var frame = buffer.getChannelData(0).length / width
      , peaks = []
      , channel
      , peak
      , i = j = 0
    for ( ; ++i < width;) {
      for (j = peak = 0; ++j < buffer.numberOfChannels;) {
        channel = buffer.getChannelData(j)
        peak += channel.subarray(i * frame, (i + 1) * frame).max()
      }
      peaks.push(peak)
    }
    return peaks
  }

  window.waveSvg = function(args) {
    if (typeof args.buffer == "undefined")
      throw "you must pass an audio buffer";

    if (typeof args.maxHeight == "undefined")
      throw "you must pass a max height";

    args.appendTo = args.appendTo || document.body;
    draw(args);
  }
})();
