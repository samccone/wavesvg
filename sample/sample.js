var target = document.getElementById('target')
  , report = document.getElementById('report')
  , ac     = new webkitAudioContext()
  , start
  , end

target.addEventListener('dragenter', handler, false)
target.addEventListener('dragleave', handler, false)
target.addEventListener('dragover', handler, false)
target.addEventListener('drop', handler, false)

function handler( ev ){
  ev.preventDefault();
  switch( ev.type ){
    case 'dragenter':
      target.className = 'over'
      target.innerHTML = 'Drop it!'
      break
    case 'dragover':
      break
    case 'dragleave':
      target.className = ''
      target.innerHTML = 'Drag a wav or mp3 here'
      break
    case 'drop':
      target.className = ''
      target.innerHTML = 'Decoding & Processing...'
      drop(ev.dataTransfer.files)
      break
  }
  return false
}

function drop( files ){
  var reader = new FileReader()
  start = Date.now()
  reader.readAsArrayBuffer( files[0] )
  reader.addEventListener('load', function( ev ){
    ac.decodeAudioData(ev.target.result, function( buffer ){
      var source = ac.createBufferSource()
      source.buffer = buffer
      source.connect(ac.destination)
      new waveSvg({
        buffer: buffer,
        maxHeight: 300,
        width: 1300
      });
      target.style.display = 'none'
      end = Date.now()
      report.innerHTML = 'Processed in ' + ( ( end - start ) / 1000 ) + 's'
    })
  }, false)
}
