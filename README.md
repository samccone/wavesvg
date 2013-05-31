wave svg
----------------


#### wavesvg

```js
  new waveSvg({
    buffer: Audiobuffer,
    maxHeight: 300,
    width: 1300, //<default window.innerWidth>
    pixelsPerSecond: 200, //<default window.innerWidth>
    appendTo: dom node, //<default document.body>
    max: 0.2 //<defaults to the tallest audio peak>
    workerPath: "path to worker" //<defaults to peak-worker.js>
    downSample: 16 // <defaults to 16> -- higher num for faster render
  });
```
##### interface

```js
  instance.updatePixelsPerSecond(n);
  instance.updateMaxScalar(n);
  instance.updateDownSampleRate(n);
```

#### streamsvg

```js
  navigator.webkitGetUserMedia({audio: true}, function(d) {
    new streamSvg({
      maxHeight: 300,
      pixelsPerSecond: 200,
      stream: d,
      max: 2
    });
  });
```

##### interface

```js
  // you can also not pass a stream and just call
  instance.onstream(buffer);
```

#### To Dev
```
  cake watch
```

#### To Build From Source
```
  cake build
```
