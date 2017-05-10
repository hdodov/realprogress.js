XHRProgressBar.onProgress = function (loaded, total) {
	document.getElementById("bar").style.width = ((loaded / total) * window.innerWidth) + "px";
};

XHRProgressBar.onResourceLoad = function (name) {
	document.getElementById("bar-resource").innerHTML += (name.split("/").pop()) + " loaded!<br>";
};

XHRProgressBar.onLoad = function () {
	document.getElementById("bar").classList.add("hidden");
};