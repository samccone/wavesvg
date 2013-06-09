Float32Array.prototype.max = ->
  max = -Infinity
  for i in [0 .. @length]
    max = @[i] if @[i] > max
  max

class @streamSvg
  constructor: (args) ->
    throw "you must pass a max height" if !args.maxHeight?
    throw "you must pass a max" if !args.max?
    throw "you must pass pixelsPerSecond" if !args.pixelsPerSecond?

    args.appendTo             = args.appendTo or document.body
    @config                   = args
    @step                     = 0
    @deviation                = 0 # keeps track of how off true width we are

    #  if someone passes a stream then we need to process it
    if args.stream
      @streamProcessor args.stream
    else
      args.onstream = @appendWaveForm

    @constructSvg()

  streamProcessor: (stream) ->
    context                  = new webkitAudioContext
    streamSource             = context.createMediaStreamSource(stream)
    processor                = context.createScriptProcessor(2048, 1, 1)
    processor.onaudioprocess = @onstream

    streamSource.connect processor
    processor.connect context.destination

  constructSvg: ->
    @svg  = document.createElementNS "http://www.w3.org/2000/svg", "svg"
    @svg.setAttribute 'height', @config.maxHeight
    @config.appendTo.appendChild @svg

  getPeaks: (buffer) ->
    actualWidth     = @config.pixelsPerSecond * buffer.duration
    width           = Math.ceil(actualWidth)
    @deviation      += width - actualWidth
    frame           = buffer.getChannelData(0).length / width
    peaks           = []

    if @deviation >= 1 then width -= --@deviation

    for i in [0 .. width - 1]
      peak  = 0
      for j in [0 .. buffer.numberOfChannels - 1]
        channel = buffer.getChannelData(j)
        peak += channel.subarray(i * frame, (i + 1) * frame).max()
      peaks.push peak
    peaks

  onstream: (d) =>
    max   = @config.max
    d = d.inputBuffer or d
    @getPeaks(d).forEach (peak) =>
      rect  = document.createElementNS("http://www.w3.org/2000/svg", "rect")
      h     = Math.abs(Math.ceil(peak * ( @config.maxHeight / max )))
      y     = ~~((@config.maxHeight - h ) / 2)

      rect.setAttribute "x", @step++
      rect.setAttribute "width", 1
      rect.setAttribute "height", h
      rect.setAttribute "y", y
      @svg.appendChild(rect)
    @svg.setAttribute 'width', @step
