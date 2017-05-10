window.XHRProgressBar = (function () {
	var exports = {
		onResourceLoad: function () {},
		onProgress: function () {},
		onLoad: function () {}
	};

	var _resources,
		_loadedResources = [];
		_boundElements = [],
		_options = {
			tags: {
				"link": "href",
				"script": "src",
				"img": "src"
			}
		};

	function _getResources(html) {
		var tags = _options.tags, regex, match, data = [];

		for (var k in tags) {
			regex = new RegExp("\<" + k + "[^\>]*" + tags[k] + "\s*\=\s*[\'|\"]([^\'\"]+)[\'|\"][^\>]*\>", "gi");

			while (true) {
				match = regex.exec(html);
				if (match !== null) {
					data.push(match[1]);
				} else {
					break;
				}
			}
		}

		return data;
	}

	function _bindElements() {
		var tags = _options.tags, elems;

		for (var k in tags) {
			elems = document.getElementsByTagName(k);

			for (var i = 0, l = elems.length; i < l; i++) {
				if (!_boundElements.includes(elems[i])) {
					_boundElements.push(elems[i]);
					elems[i].addEventListener("load", _onLoadHandler(elems[i].getAttribute(tags[k]), k));
				}
			}
		}
	}

	function _onLoadHandler(attr, tagName) {
		return function () {
			// Plain HTML <script> tags need to have a load handler so that the elements
			// after them can be bound. They don't need to be downloaded, however,
			// so their `src` attribute is null.
			if (typeof attr === "string") {
				_loadedResources.push(attr);
				exports.onResourceLoad(attr);
				dispatchProgress();
			}

			if (tagName === "script") {
				setTimeout(_bindElements, 0);
			}
		};
	}

	function dispatchProgress(fullyLoaded) {
		if (_resources) {
			exports.onProgress(
				(fullyLoaded) ? _resources.length : _loadedResources.length,
				_resources.length
			);
		}
	}

	window.addEventListener("load", function () {
		dispatchProgress(true);
		exports.onLoad();
	});

	var req = new XMLHttpRequest();
	req.open("GET", document.location.href);
	req.onreadystatechange = function () {
		if (req.readyState === 4 && (req.status === 200 || req.status == 0)) {
			_resources = _getResources(req.responseText);
			dispatchProgress();
		}
	};

	req.send(null);
	_bindElements();

	return exports;
})();