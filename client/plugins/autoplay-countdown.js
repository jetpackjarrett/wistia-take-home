Wistia.plugin('autoplay-countdown', (video, { medias, from }) => {
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

    const countdown = countdownOverlay.querySelector('.countdown-timer');
    const title = countdownOverlay.querySelector('.countdown-title');
    const bg = `url(${nextInPlaylist.thumbnail.url})`;
    countdown.style['background-image'] = bg;
    title.innerText = nextInPlaylist.name;
    countdown.innerText = from;

    video.grid.left_inside.appendChild(countdownOverlay);
    const interval = setInterval(() => {
      if (from === 0) {
        countdownOverlay.remove();
        clearInterval(interval);
        video.play();
        return;
      }
      countdown.innerText = --from;
    }, 1000);
    return () => {
      clearInterval(interval);
      video.unbind();
    };
  });
});
