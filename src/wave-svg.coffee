Float32Array.prototype.max = ->
  max = -Infinity
  for i in [0 .. @length]
    max = @[i] if @[i] > max
  max

class @waveSvg
  constructor: (args = {}) ->
    throw "you must pass an audio buffer" if !args.buffer?
    throw "you must pass a max height" if !args.maxHeight?
    args.appendTo     = args.appendTo or document.body
    args.width        = args.width or if args.pixelsPerSecond? then args.pixelsPerSecond * args.buffer.duration else window.innerWidth
    @worker           = new Worker(args.workerPath or "peak-worker.js")
    @worker.onmessage = @drawPeaks
    @config           = args
    @draw()

  updateMaxScalar: (max) ->
    @config.max = max
    @removeSvg()
    @draw()

  updatePixelsPerSecond: (amount) ->
    @config.pixelsPerSecond = amount
    @config.width = @config.pixelsPerSecond * @config.buffer.duration
    @removeSvg()
    @draw()

  removeSvg: ->
    @config.appendTo.removeChild @svg

  drawPeaks: (e) =>
    peaks           = e.data.peaks
    @svg            = document.createElementNS "http://www.w3.org/2000/svg", "svg"
    @svg.innerHTML  = ""
    max             = @config.max or Math.max.apply(Math, peaks)

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

    @svg.setAttribute 'height', @config.maxHeight
    @svg.setAttribute 'width', @config.width
    @config.appendTo.appendChild @svg
    console?.warn? "drawn in #{(new Date().getTime() - @startTime)/1000} sec"

  draw: ->
    @startTime        = new Date().getTime()
    @getPeaks()

  getPeaks: ->
    channels = []
    for i in [0 .. @config.buffer.numberOfChannels - 1]
      channels.push Float32Array.prototype.subarray.apply @config.buffer.getChannelData(i)

    @worker.postMessage
      length: @config.buffer.getChannelData(0).length
      channels: channels
      width: @config.width
