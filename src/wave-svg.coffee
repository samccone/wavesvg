class @waveSvg
  constructor: (args = {}) ->
    @config = args

    throw "you must pass an audio buffer" if !@config.buffer?
    throw "you must pass a max height" if !@config.maxHeight?

    @config.appendTo      = @config.appendTo or document.body
    @config.width         = @config.width or if @config.pixelsPerSecond? then @config.pixelsPerSecond * @config.buffer.duration else window.innerWidth
    @config.downSample    = @config.downSample or 16
    @config.shrunkBuffer  = @shrinkBuffer(@config.buffer, @config.downSample)

    @worker               = new Worker(@config.workerPath or "peak-worker.js")
    @worker.onmessage     = @drawPeaks

    @draw()

  updateMaxScalar: (max) ->
    @config.max = max
    @removeSvg()
    @draw()

  updateDownSampleRate: (rate) ->
    @config.shrunkBuffer = @shrinkBuffer(@config.buffer, rate)
    @removeSvg()
    @draw()

  shrinkBuffer: (b, downSample) ->
    toReturn = []
    for i in [0 .. b.numberOfChannels - 1]
      step  = 0
      cd    = b.getChannelData(i)

      toReturn.push new Float32Array(~~(cd.length/downSample))
      for j in [0 .. (toReturn[i].length) - 1]
        toReturn[i][step++] = cd[j * downSample]
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
