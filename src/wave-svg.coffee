Float32Array.prototype.max = ->
  max = -Infinity
  for i in [0 .. @length]
    max = @[i] if @[i] > max
  max

class @waveSvg
  constructor: (args = {}) ->
    throw "you must pass an audio buffer" if !args.buffer?
    throw "you must pass a max height" if !args.maxHeight?
    args.appendTo = args.appendTo or document.body
    args.width    = args.width or if args.pixelsPerSecond? then args.pixelsPerSecond * args.buffer.duration else window.innerWidth
    @config = args
    @draw()

  draw: ->
    @svg  = document.createElementNS "http://www.w3.org/2000/svg", "svg"
    peaks = @getPeaks @config.buffer
    max   = @config.max or Math.max.apply(Math, peaks)
    for peak, i in peaks
      w     = i
      h     = Math.abs(~~(peak * ( @config.maxHeight / max )))
      y     = ~~((@config.maxHeight - h ) / 2)
      rect  = document.createElementNS("http://www.w3.org/2000/svg", "rect")
      rect.setAttribute "x", i
      rect.setAttribute "width", 1
      rect.setAttribute "height", h
      rect.setAttribute "y", y
      @svg.appendChild(rect)

    @svg.setAttribute 'width', @config.width
    @svg.setAttribute 'height', @config.maxHeight
    @config.appendTo.appendChild @svg


  getPeaks: (buffer) ->
    frame   = buffer.getChannelData(0).length / @config.width
    peaks   = []
    channel = null
    for i in [0 .. @config.width]
      peak    = 0
      for j in [0 .. buffer.numberOfChannels - 1]
        channel = buffer.getChannelData(j)
        peak += channel.subarray(i * frame, (i + 1) * frame).max()
      peaks.push peak
    peaks
