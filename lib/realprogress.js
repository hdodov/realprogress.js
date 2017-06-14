window.RealProgress = (function () {
    var exports = {
        onResourceLoad: function () {},
        onProgress: function () {},
        onLoad: function () {}
    };

    var _total = 0,
        _loaded = 0,
        _windowLoaded = false,
        _boundElements = [],
        _tags = {
            "link": "href",
            "script": "src",
            "img": "src"
        };

    function _bindElements() {
        for (var tag in _tags) {
            for (var i = 0, elems = document.getElementsByTagName(tag), l = elems.length; i < l; i++) {
                if (_boundElements.indexOf(elems[i]) === -1) {
                    _boundElements.push(elems[i]);
                    elems[i].addEventListener("load", _onLoadHandler(
                        elems[i].getAttribute(_tags[tag]), tag
                    ));
                }
            }
        }
    }

    function _onLoadHandler(attr, tag) {
        return function () {
            if (typeof attr === "string") {
                _loaded++;
                _dispatchProgress();
                exports.onResourceLoad(attr);
            }

            if (tag === "script") {
                setTimeout(_bindElements, 0);
            }
        };
    }

    function _getResources(html) {
        for (var tag in _tags) {
            var regex = new RegExp("\<" + tag + "[^\>]*" + _tags[tag] + "\s*\=\s*[\'|\"]([^\'\"]+)[\'|\"][^\>]*\>", "gi");

            while (regex.exec(html) !== null) {
                _total++;
            }
        }
    }

    function _dispatchProgress() {
        exports.onProgress(_windowLoaded ? 1 : (_total > 0 ? (_loaded / _total) : 0));
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

    _bindElements();

    window.addEventListener("load", function () {
        _windowLoaded = true;
        _dispatchProgress();
        exports.onLoad();

        _boundElements = [];
    });

    return exports;
})();