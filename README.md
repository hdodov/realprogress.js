# What is realprogress.js?
It's a _very_ light JavaScript library providing website loading progress that's realitvely...

![realprogress.js](https://media.giphy.com/media/xUPGcBvvSVKmwKEcI8/giphy.gif)

In some cases, it's not 100% accurate, but it still tells the viewer whether something is actually happening on your page. At the very least, it won't update when you have no internet connection.

## [Live demo](https://hdodov.github.io/realprogress.js/)
Use Chrome DevTools to apply network throttling and/or disable cache to better see how it works.

## [YouTube demo](https://www.youtube.com/watch?v=yUu6lu9wTA8)
A video showcasing realprogress with different throttling settings.

# Installation
```
npm install realprogress
```
or
```
git clone https://github.com/hdodov/realprogress.js
```

# How does it work?
Stuff like [ProgressBar.js](https://kimmobrunfeldt.github.io/progressbar.js/) by [Kimmo Brunfeldt](https://github.com/kimmobrunfeldt) trick the viewer by incrementing the progress value at random times by a random amount to _simulate_ progress, even if there's no progress at all. What realprogress does is it scans the page's HTML for the different resources that have to be downloaded and emits a signal upon their `onload` event.

Here's precisely what happens:

1. When realprogress is initialized, an `XMLHttpRequest` is fired with `document.location.href` as the URL. This gets the full HTML of the page it has been loaded on.

    The reason something like `document.documentElement.innerHTML` isn't used is because it doesn't provide the full HTML. It will return just the HTML up to this point. It would be something like this:
    
    ```html
    <head>
      <title>realprogress</title>
      <script type="text/javascript" src="../lib/realprogress.js"></script></head>
    ```

2. After realprogress is loaded and whenever the `onload` event of a `<script>` is fired, a `load` listener is attached to all `<link>`, `<script>` and `<img>` elements to know when they're ready. The reason a check for new elements is made after the `load` of each `<script>` is because they block HTML parsing. This means that everything after the tag is parsed _only after_ the script itself has loaded.

3. When the request from #1 returns a response, the HTML is processed by a regular expression which finds all `<link>` tags with `href` attribute, `<script>` with `src` and `<img>` with `src`. This way, we find out how much resources we're expecting.

4. After the HTML has been searched, the `onProgress` event starts dispatching the progress value whenever a resource has loaded. This value ranges from `0` to `1`.

5. The end of all loading is marked by `window.onload`. When it fires, realprogress dispatches its `onProgress` with a value of `1` and its own `onLoad`.

# Usage
It's recommended to include the library as close to the top of the `<body>` as possible (preferably at the top) and the script using it should be immediately after. You can even put it at the top of the `<head>`.

**Tip:** When you handle the `onProgress` event, check whether your progress bar (or whatever is visualizing the progress) exists. That's because `<script>` tags block HTML parsing, so if your script is above the bar, it would not yet exist.

# API
```js
RealProgress.init = function (options) {};

RealProgress.onProgress = function (progress) {
  // progress - value ranging from 0 to 1
};

RealProgress.onResourceLoad = function (resource) {
  // resource - loaded resource's href/src attribute
};

RealProgress.onLoad = function (uncaptured) {
  // uncaptured - array of resources that were found in the source code, but their "load" event wasn't captured
  // fired when `window.onload` is dispatched
};
```

# Options
Options are passed to the `init()` metod.
- `regex: function (tag, attribute)` - You could provide a custom regular expression for searching resources in the source code. It should return a `RegExp` object that matches the given `tag` and `attribute`.
- `untracked: Array` - All resources you don't want to affect the progress. Can contain strings or regular expressions. If a string is found, it must match the whole resource name. If it's regex, it simply has to match.

  **Tip:** You could check which resources fail to be captured via the `onLoad` method and add them here, so that they're not tracked at all. This would improve the accuracy of your loading bar.

- `tags: Object` - Which tags and attributes to search in the source code. Tag names should be the keys and their attributes should be the values. Those same pairs are passed to the function getting the regex above. Defaults to:

  ```json
  {
      "link": "href",
      "iframe": "src",
      "source": "src",
      "script": "src",
      "img": "src"
  }
  ```

  **Warning:** You should always have `"script": "src"` or some resources might not be tracked.

# Keep in mind that...
- It uses a regular expression! Be careful with very large HTML files.

- The `XMLHttpRequest` should be fast, because it requests the very document that it's been initialized from, which is likely to be cached. However, _it's not instantaneous_, meaning that some resources (probably in the `<head>`) might be loaded _before_ the library and not counted towards the progress.

- `<script>` tags block HTML parsing until they're loaded! Let's say I have this markup:

    ```html
    <img src="pic1.jpg">
    <script src="script.js"></script>
    <img src="pic2.jpg">
    <img src="pic3.jpg">
    ```
    
  The progress of `pic1` would be effectively tracked, but `pic2` and `pic3` will have the `load` listener attached to them _only after_ `script.js` has loaded. That's because everything after the `</script>` tag is parsed _after_ the contents of the `<script>` are present. To avoid this, simply put your `<script>` tags at the bottom of the `<body>`.

- Tracking the progress of scripts will not be accurate. 😢 It's because of the previous bullet point. If you have this markup:

    ```html
    <script src="script1.js"></script>
    <script src="script2.js"></script>
    <script src="script3.js"></script>
    ```

  `script2` will only be tracked after `script1` has loaded and `script3` - after `script2`. If `script2` and `script3` load before `script1`, their `load` events would have been triggered _before_ realprogress had the chance to add an event listener to them.
