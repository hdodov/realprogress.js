var para = document.getElementById("bar-resource"),
	bar = document.getElementById("bar");

RealProgress.onResourceLoad = function (name) {
	para.innerHTML += (name.split("/").pop()) + " loaded!<br>";
};

RealProgress.onProgress = function (loaded, total) {
	bar.style.width = ((loaded / total) * window.innerWidth) + "px";
};

RealProgress.onLoad = function () {
	bar.classList.add("hidden");
};