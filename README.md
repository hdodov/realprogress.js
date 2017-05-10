# What is realprogress.js?
It's a real progress bar for web pages that works by utilizing XHR. In some cases, it's not 100% accurate, but it still tells the user that something is happening on your page. Here is a [demo](https://realprogress.netlify.com/). Use Chrome DevTools to apply network throttling and/or disable cache to better see how it works.

![realprogress.js in action](https://media.giphy.com/media/IjMpyriRcn4Hu/giphy.gif)

Stuff like [ProgressBar.js](https://kimmobrunfeldt.github.io/progressbar.js/) by [Kimmo Brunfeldt](https://github.com/kimmobrunfeldt) trick the user by incrementing the progress bar at random times by a random amount to simulate real progress even if there's no progress at all. What realprogress provides is something a little bit more real and accurate.

# How does it work?
1. Immediately after being loaded, the snippet fires an `XMLHttpRequest` with `document.location.href` as URL. This gets the full HTML of the page it has been loaded on.
2. When the snippet is loaded and after the `onload` event of each `<script>`, it adds an event listener to all `link`, `script` and `img` tags to keep up with what's loaded.
3. When the request from #1 returns a response, the HTML is processed by a regular expression which finds all `<link>` tags with `href` attribute, `<script>` with `src` and `<img>` with `src`. From that, it knows how much files are expected to be downloaded.
4. After the HTML has been searched, the `onProgress` event starts dispatching the number of loaded resources and the total resources expected.
5. `window.onload` marks the end all loading. The snippet listens to this event and dispatches `onProgress` and its own `onLoad`.

# Usage
It is recommended to put the `realprogress.js` `<script>` as close to the top of the `<body>` as possible. Whatever is visualizing the progress should be above it. Like this:
```html
<body>
  <div id="bar"><p id="bar-resource"></p></div>

  <script type="text/javascript" src="realprogress.min.js"></script>
  <script type="text/javascript" src="script.js"></script> <!-- uses xhrpb -->

  <img src="http://placehold.it/350x150">
  <img src="http://placehold.it/350x160">
  ...
</body>
```

# API
There are just three events:
```js
XHRProgressBar.onProgress = function (loaded, total) {
  // loaded --- number of loaded resources
  // total --- total resources found in HTML
};

XHRProgressBar.onResourceLoad = function (resource) {
  // resource --- loaded resource's href/src attribute
};

XHRProgressBar.onLoad = function () {
  // fired when `window.onload` is dispatched
};
```

# Keep in mind that...
* It uses a regular expression! Be careful with large HTML files.
* The XHR should be fast, because it requests the very document that it's been loaded on, which is likely to be cached. However, _it's not instantaneous_, meaning that some resources (probably in the `<head>`) might be loaded _before_ the snippet and not counted towards the progress.
* `<script>` tags block HTML parsing until they're loaded! Let's say I have this markup:

    ```html
    <img src="pic1.jpg">
    <script src="script.js"></script>
    <img src="pic2.jpg">
    <img src="pic3.jpg">
    ```
    
  realprogress would effectively track `pic1`, but `pic2` and `pic3` will have the `load` event listener attached to them _only after_ `script.js` has loaded. That's because everything after the `</script>` tag is parsed _after_ the contents of the `<script>` are present. To avoid this, simply put your `<script>` tags at the bottom of the `<body>`.
* Tracking the progress of scripts will not be accurate. 😢 The reason is the previous bullet point. If you have this markup:

    ```html
    <script src="script1.js"></script>
    <script src="script2.js"></script>
    <script src="script3.js"></script>
    ```

  `script2` will only be tracked after `script1` has loaded and `script3` - after `script2`. If `script2` and `script3` load after `script1`, their `load` events would have been triggered _before_ realprogress had the chance to add an event listener to them, meaning that they won't be added to the loaded resources array. **This might be fixed if there's a way to check whether a `<script>` has loaded.**
