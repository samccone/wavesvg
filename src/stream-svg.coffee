Float32Array.prototype.max = ->
  max = -Infinity
  for i in [0 .. @length]
    max = @[i] if @[i] > max
  max

class @streamSvg
  constructor: (args) ->
    throw "you must pass a stream" if !args.stream?
    throw "you must pass a max height" if !args.maxHeight?
    throw "you must pass a max" if !args.max?
    throw "you must pass pixelsPerSecond" if !args.pixelsPerSecond?

    args.appendTo             = args.appendTo or document.body
    @context                  = new webkitAudioContext
    @streamSource             = @context.createMediaStreamSource(args.stream)
    @processor                = @context.createScriptProcessor(2048, 1, 1)
    @config                   = args
    @step                     = 0
    @processor.onaudioprocess = @appendWaveForm

    @streamSource.connect @processor
    @processor.connect @context.destination
    @constructSvg()

  constructSvg: ->
    @svg  = document.createElementNS "http://www.w3.org/2000/svg", "svg"
    @svg.setAttribute 'height', @config.maxHeight
    @config.appendTo.appendChild @svg


  getPeaks: (buffer) ->
    width   = ~~(@config.pixelsPerSecond * buffer.duration)
    frame   = buffer.getChannelData(0).length / width
    peaks   = []
    channel = null
    for i in [0 .. width - 1]
      peak  = 0
      for j in [0 .. buffer.numberOfChannels - 1]
        channel = buffer.getChannelData(j)
        peak += channel.subarray(i * frame, (i + 1) * frame).max()
      peaks.push peak
    peaks

  appendWaveForm: (d) =>
    max   = @config.max
    @getPeaks(d.inputBuffer).forEach (peak) =>
      rect  = document.createElementNS("http://www.w3.org/2000/svg", "rect")
      h     = Math.abs(~~(peak * ( @config.maxHeight / max )))
      y     = ~~((@config.maxHeight - h ) / 2)

      rect.setAttribute "x", @step++
      rect.setAttribute "width", 1
      rect.setAttribute "height", h
      rect.setAttribute "y", y
      @svg.appendChild(rect)
