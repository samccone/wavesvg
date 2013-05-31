class @waveSvg
  constructor: (args = {}) ->
    throw "you must pass an audio buffer" if !args.buffer?
    throw "you must pass a max height" if !args.maxHeight?
    args.appendTo     = args.appendTo or document.body
    args.width        = args.width or if args.pixelsPerSecond? then args.pixelsPerSecond * args.buffer.duration else window.innerWidth
    args.downSample   = args.downSample or 16
    args.shrunkBuffer = @shrinkBuffer(args.buffer, args.downSample)
    @worker           = new Worker(args.workerPath or "peak-worker.js")
    @worker.onmessage = @drawPeaks
    @config           = args
    @draw()

  updateMaxScalar: (max) ->
    @config.max = max
    @removeSvg()
    @draw()

  shrinkBuffer: (b, downSample) ->
    toReturn = []
    for i in [0 .. b.numberOfChannels - 1]
      step = 0
      toReturn.push new Float32Array(~~(b.getChannelData(i).length/downSample))
      for j in [0 .. (toReturn[i].length) - 1]
        toReturn[i][step++] = b.getChannelData(i)[j * downSample]
    toReturn

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
    @startTime = new Date().getTime()
    @getPeaks()

  getPeaks: ->
    channels = []

    @worker.postMessage
      length: @config.shrunkBuffer[0].length
      channels: @config.shrunkBuffer
      width: @config.width
