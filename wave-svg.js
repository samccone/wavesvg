!(function() {
  function draw(args){
    var peaks = getPeaks(args.buffer, args.width || window.innerWidth)
      , max   = Math.max.apply(Math, peaks)
      , svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
      , polyLine  = document.createElementNS("http://www.w3.org/2000/svg", "polyline")
      , linePath = "";

    peaks.forEach(function(peak, index){
      var h     = ~~(peak * ( args.maxHeight / max ));
      var w     = index;
      linePath += w+","+h+",";
    });

    polyLine.setAttribute("points", linePath.substring(0, linePath.length - 1));
    svg.appendChild(polyLine);
    args.appendTo.appendChild(svg);
  }

  function getPeaks( buffer , width){
    var frame = buffer.getChannelData(0).length / width
      , slice = Array.prototype.slice
      , peaks = []
      , channel
      , peak
      , i = j = 0
    for ( ; ++i < width;) {
      for (j = peak = 0; ++j < buffer.numberOfChannels;) {
        channel = buffer.getChannelData(j)
        peak += Math.max.apply(Math, slice.call(channel, i * frame, (i + 1) * frame))
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
