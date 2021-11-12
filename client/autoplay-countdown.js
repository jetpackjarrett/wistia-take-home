Wistia.plugin('autoplay-countdown', function (video, { from: countdown }) {
  const endTime = video.duration();
  video.bind('crosstime', endTime, function () {
    video.pause();
    const timer = setInterval(() => {
      if (countdown === 0) {
        clearInterval(timer);
        video.play();
        return;
      }

      console.log(countdown--);
    }, 1000);
    return video.unbind;
  });
});
