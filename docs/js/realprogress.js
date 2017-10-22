window.RealProgress = (function () {
    var exports = {
        onResourceLoad: null,
        onProgress: null,
        onLoad: null
    };

    var _total = 0
    ,   _loaded = 0
    ,   _windowLoaded = false
    ,   _boundElements = []
    ,   _pendingResources = []
    ,   _options = {
            regex: function (tag, attr) {
                return new RegExp("<" + tag + "[^>]*" + attr + "\s*\=\s*[\'\"]([^\'\"]+)[\'\"][^>]*>", "gi");
            },
            untracked: [],
            tags: {
                "link": "href",
                "iframe": "src",
                "source": "src",
                "script": "src",
                "img": "src"
            }
        };

    function _isUntracked(subject) {
        var list = _options.untracked;

        for (var i = 0; i < list.length; i++) {
            if (
                (
                    typeof list[i] == "string" &&
                    list[i] == subject
                ) ||
                (
                    typeof list[i] == "object" &&
                    list[i] instanceof RegExp &&
                    typeof subject == "string" &&
                    subject.match(list[i])
                )
            ) {
                return true;
            }
        }

        return false;
    }

    function _bindElements() {
        var elems, attr;

        for (var t in _options.tags) {
            elems = document.getElementsByTagName(t);

            for (var i = 0; i < elems.length; i++) {
                attr = elems[i].getAttribute(_options.tags[t]);

                if (_boundElements.indexOf(elems[i]) === -1) {
                    _boundElements.push(elems[i]);
                    elems[i].addEventListener("load", _onLoadHandler(attr, t));
                }
            }
        }
    }

    function _onLoadHandler(attr, tag) {
        var hasAttr = (typeof attr == "string")
        ,   tracked = !_isUntracked(attr);

        if (tracked && hasAttr) {
            _pendingResources.push(attr);
        }

        return function () {
            if (tracked && hasAttr) {
                _loaded++;
                _dispatchProgress();

                if (typeof exports.onResourceLoad == "function") {
                    exports.onResourceLoad(attr);
                }

                var index = _pendingResources.indexOf(attr);
                if (index > -1) {
                    _pendingResources.splice(index, 1);
                }
            }

            if (tag == "script") {
                setTimeout(_bindElements, 0);
            }
        };
    }

    function _getResources(html) {
        var match, regex;

        for (var tag in _options.tags) {
            regex = _options.regex(tag, _options.tags[tag]);

            while (1) {
                match = regex.exec(html);

                if (match != null && match.length && !_isUntracked(match[1])) {
                    _total++;
                } else {
                    break;
                }
            }
        }
    }

    function _dispatchProgress() {
        if (typeof exports.onProgress == "function") {
            exports.onProgress(_windowLoaded ? 1 : (_total > 0 ? (_loaded / _total) : 0));
        }
    }

    exports.init = function (opts) {
        if (typeof opts == "object") {
            for (var k in opts) {
                _options[k] = opts[k];
            }
        }

        var req = new XMLHttpRequest();
        req.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                _getResources(this.responseText);
                _dispatchProgress();
            }
        };
        req.open("GET", document.location.href);
        req.send(null);

        window.addEventListener("load", function () {
            _windowLoaded = true;
            _dispatchProgress();

            if (typeof exports.onLoad == "function") {
                exports.onLoad(_pendingResources);
            }
        
            _boundElements = [];
        });

        setTimeout(_bindElements, 0);
    };

    return exports;
})();