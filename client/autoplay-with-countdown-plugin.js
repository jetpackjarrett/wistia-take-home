function highlightCurrent(video) {
  const link = document
    .querySelector(`[href="#wistia_${video.hashedId()}"]`)
    .closest('li');
  Array.from(document.querySelectorAll('.currently-playing')).forEach((el) => {
    if (el !== link) {
      el.classList.replace('currently-playing', 'played');
      document.getElementById('medias').appendChild(el);
    }
  });

  if (link) {
    link.classList.add('currently-playing');
  }
}

_WISTIA_AUTOPLAYED = new Set();

Wistia.plugin('autoplay-with-countdown', (video, { medias, from }) => {
  highlightCurrent(video);

  _WISTIA_AUTOPLAYED.add(video.hashedId());
  const nextInPlaylist = medias.find((media) => {
    return !_WISTIA_AUTOPLAYED.has(media.hashed_id);
  });

  if (!nextInPlaylist) {
    return;
  }

  const endTime = video.duration();
  video.addToPlaylist(nextInPlaylist.hashed_id);

  video.bind('crosstime', endTime, () => {
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
