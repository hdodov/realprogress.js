# What is xhr-progress-bar?
It's a _fairly_ accurate progress bar for web pages that works by utilizing XHR.

Stuff like [ProgressBar.js](https://kimmobrunfeldt.github.io/progressbar.js/) by [Kimmo Brunfeldt](https://github.com/kimmobrunfeldt) trick the user by incrementing the progress bar at random times by a random amount to simulate real progress even if there's no progress at all. What xhr-progress-bar provides is something a little bit more accurate.

# How does it work?
1. Immediately after being loaded, the snippet fires an `XMLHttpRequest` with `document.location.href` as URL. This gets the full HTML of the page it has been loaded on.
2. When the snippet is loaded and after the `onload` event of each `<script>`, it adds an event listener to all `link`, `script` and `img` tags to keep up with what's loaded.
3. When the request from #1 returns a response, the HTML is processed by a Regular Expression which finds all `<link>` tags with `href` attribute, `<script>` with `src` and `<img>` with `src`. From that, it knows how much files are expected to be downloaded.
4. After the HTML has been searched, the `onProgress` event starts dispatching the number of loaded resources and the total resources expected.
5. `window.onload` marks the end all loading. The snippet listens to this event and dispatches `onProgress` and its own `onLoad`.
