Float32Array.prototype.max = ->
  max = -Infinity
  for i in [0 .. @length]
    max = Math.abs1(@[i]) if Math.abs1(@[i]) > max
    return 1 if max >= 1
  max

Math.prototype.abs1 = (val) ->
  if val < 0 then -val else val

@addEventListener 'message', (e) ->
  frame   = e.data.channels[0].length / e.data.width
  peaks   = []
  for i in [0 .. e.data.width] by 1
    peak    = 0
    for j in [0 .. e.data.channels.length - 1]
      peak += e.data.channels[j].subarray(~~(i * frame), ~~((i + 1) * frame)).max()
    peaks.push peak
  @postMessage
    peaks: peaks
