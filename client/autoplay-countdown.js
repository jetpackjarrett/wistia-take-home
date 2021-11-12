Wistia.plugin(
  'autoplay-countdown',
  function (video, { medias, from: countdown }) {
    const endTime = video.duration();
    const nextVideo = video.nextVideo();
    if (!nextVideo) {
      return;
    }

    const nextInPlaylist = medias.find((media) => {
      return media.hashed_id === nextVideo.hashedId;
    });

    video.bind('crosstime', endTime, function () {
      video.pause();
      const template = document.getElementById('countdown-template');
      const clone = template.content.cloneNode(true);
      const countdownOverlay = clone.children[0];
      countdownOverlay.style.position = 'absolute';
      countdownOverlay.style.color = 'white';
      countdownOverlay.style.height = video.videoHeight() + 'px';
      countdownOverlay.style.width = video.videoWidth() + 'px';

      const timer = countdownOverlay.querySelector('.countdown-timer');
      const title = countdownOverlay.querySelector('.countdown-title');
      timer.style['background-image'] = `url(${nextInPlaylist.thumbnail.url})`;
      // timer.style.width = `${nextInPlaylist.thumbnail.width}px`;
      // timer.style.height = `${nextInPlaylist.thumbnail.height}px`;
      title.innerText = nextInPlaylist.name;
      timer.innerText = countdown;

      video.grid.left_inside.appendChild(countdownOverlay);
      const interval = setInterval(() => {
        if (countdown === 0) {
          countdownOverlay.remove();
          clearInterval(timer);
          video.play();
          return;
        }
        timer.innerText = --countdown;
      }, 1000);
      return video.unbind;
    });
  }
);
