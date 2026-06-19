document.addEventListener("DOMContentLoaded", function () {
    var shells = Array.prototype.slice.call(document.querySelectorAll(".player-shell"));

    shells.forEach(function (shell) {
        var video = shell.querySelector("video");
        var button = shell.querySelector(".play-layer");
        var hlsInstance = null;
        var isReady = false;

        function loadVideo() {
            if (!video || isReady) {
                return;
            }

            var source = video.getAttribute("data-stream");
            if (!source) {
                return;
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else {
                video.src = source;
            }

            isReady = true;
        }

        function startVideo() {
            loadVideo();
            shell.classList.add("is-playing");
            if (video) {
                var playTask = video.play();
                if (playTask && typeof playTask.catch === "function") {
                    playTask.catch(function () {
                        shell.classList.remove("is-playing");
                    });
                }
            }
        }

        if (button) {
            button.addEventListener("click", startVideo);
        }

        if (video) {
            video.addEventListener("click", function () {
                if (video.paused) {
                    startVideo();
                }
            });
            video.addEventListener("play", function () {
                shell.classList.add("is-playing");
            });
            video.addEventListener("pause", function () {
                if (!video.currentTime) {
                    shell.classList.remove("is-playing");
                }
            });
            video.addEventListener("ended", function () {
                shell.classList.remove("is-playing");
            });
        }

        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
});
