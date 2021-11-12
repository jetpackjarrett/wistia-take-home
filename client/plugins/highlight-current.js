Wistia.plugin('highlight-current', (video) => {
  const link = document.querySelector(`[href="#wistia_${video.hashedId()}"]`);

  Array.from(document.querySelectorAll('.currently-played')).forEach((el) => {
    if (el !== link) {
      el.classList.remove('currently-played');
    }
  });

  if (link) {
    link.classList.add('currently-played');
  }
});
