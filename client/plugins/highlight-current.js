Wistia.plugin('highlight-current', (video) => {
  const link = document.querySelector(`[href="#wistia_${video.hashedId()}"]`);

  Array.from(document.querySelectorAll('.currently-played')).forEach((el) => {
    if (el !== link) {
      el.classList.remove('currently-played');
    }
  });

  console.log('hl', video);
  if (link) {
    link.classList.add('currently-played');
  }

  video.bind('beforereplace', function () {
    console.log('replacing');
  });

  // video.bind('play', () => {
  //   const link = document.querySelector(`[href="#wistia_${video.hashedId()}"]`);
  //   if (link) {
  //     link.classList.add('current');
  //   }

  //   return video.unbind;
  // });

  // video.bind('end', () => {
  //   console.log('end');
  //   const link = document.querySelector(`[href="#wistia_${video.hashedId()}"]`);
  //   if (link) {
  //     link.classList.add('current');
  //   }
  // });
});
