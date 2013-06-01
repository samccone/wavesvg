Math.abs1 = (val) ->
  if val < 0 then -val else val

Math.ceil1 = (val) ->
    f = (val << 0)
    f = if f is val then f else f + 1

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
    @draw()

  updateDownSampleRate: (rate) ->
    @config.shrunkBuffer = @shrinkBuffer(@config.buffer, rate)
    @draw()

  shrinkBuffer: (b, downSample) ->
    toReturn = []
    for i in [0 ... b.numberOfChannels]
      step  = 0
      cd    = b.getChannelData(i)

      toReturn.push new Float32Array(~~(cd.length/downSample))
      for j in [0 ... (toReturn[i].length)]
        toReturn[i][step++] = cd[j * downSample]
    toReturn

  updatePixelsPerSecond: (amount) ->
    oldWidth = @config.width
    @config.pixelsPerSecond = amount
    @config.width = @config.pixelsPerSecond * @config.buffer.duration
    @draw()
    @config.width - oldWidth

  drawPeaks: (e) =>
    peaks           = e.data.peaks
    svg             = document.createElementNS "http://www.w3.org/2000/svg", "svg"
    svg.innerHTML   = ""
    max             = @config.max or Math.max.apply(Math, peaks)

    for peak, i in peaks
      w     = i
      h     = Math.abs1(Math.ceil1(peak * ( @config.maxHeight / max )))
      y     = ~~((@config.maxHeight - h ) / 2)
      rect  = document.createElementNS("http://www.w3.org/2000/svg", "rect")
      rect.setAttribute "x", i
      rect.setAttribute "width", 1
      rect.setAttribute "height", h
      rect.setAttribute "y", y
      svg.appendChild(rect)

    svg.setAttribute 'height', @config.maxHeight
    svg.setAttribute 'width', @config.width
    if @svg then @config.appendTo.replaceChild svg, @svg else @config.appendTo.appendChild svg
    @svg = svg
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
