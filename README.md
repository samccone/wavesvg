wave svg
----------------


#### API

```js
  new waveSvg({
    buffer: Audiobuffer,
    maxHeight: 300,
    width: 1300, <default window.innerWidth>
    pixelsPerSecond: 200, <default window.innerWidth>
    appendTo: dom node, <default document.body>
    max: 0.2 <defaults to the tallest audio peak>
  });
```

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

#### To Dev
```
  cake watch
```

#### To Build From Source
```
  cake build
```
