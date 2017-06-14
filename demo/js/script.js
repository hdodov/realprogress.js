RealProgress.onResourceLoad = function (name) {
    var para = document.getElementById("loaded");
    if (para) {
        para.innerHTML += (name.split("/").pop()) + " loaded!<br>";
    }	
};

RealProgress.onProgress = function (progress) {
    var bar = document.getElementById("bar");
    if (bar) {
        bar.style.width = (progress * 100) + "%";
    }
};

RealProgress.onLoad = function () {
	document.getElementById("bar").classList.add("hidden");
};