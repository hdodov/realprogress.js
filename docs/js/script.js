(function () {
    var _loaded = []
    ,   _progress = 0
    ,   _loadedPara = null
    ,   _loadingBar = null;

    function render() {
        _loadedPara = _loadedPara || document.getElementById("loaded");
        _loadingBar = _loadingBar || document.getElementById("bar");

        if (_loadedPara) {
            _loadedPara.innerHTML = "";

            for (var i = 0; i < _loaded.length; i++) {
                _loadedPara.innerHTML += _loaded[i] + " loaded!<br>";
            }
        }

        if (_loadingBar) {
            _loadingBar.style.width = (_progress * 100) + "%";
        }
    }

    RealProgress.onResourceLoad = function (name) {
        _loaded.push(name.split("/").pop());
    };

    RealProgress.onProgress = function (progress) {
        _progress = progress;
        render();
    };

    RealProgress.onLoad = function (uncaptured) {
        document.getElementById("bar").classList.add("hidden");
        console.log("uncaptured", uncaptured);
    };
})(); 

RealProgress.init({
    untracked: [
        "favicon.ico",
        "js/script.js",
        "js/realprogress.js"
    ]
});