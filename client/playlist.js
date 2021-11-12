'use strict';

import { TOKEN, formatTime } from './common.js';

class Playlist {
  constructor() {
    this.medias = [];
  }

  getMedias() {
    const url = new URL('https://api.wistia.com/v1/medias.json');
    url.searchParams.set('api_password', TOKEN);
    return fetch(String(url))
      .then((res) => {
        if (res.ok) {
          return res.json();
        }
      })
      .then((json) => {
        this.medias = json;
        return this.medias;
      });
  }

  renderMedias() {
    this.medias.forEach(this.renderMedia);
  }

  renderMedia(media) {
    const template = document.getElementById('media-template');
    const clone = template.content.cloneNode(true);
    const el = clone.children[0];

    el.querySelector('.thumbnail').setAttribute('src', media.thumbnail.url);
    el.querySelector('.title').innerText = media.name;
    el.querySelector('.duration').innerText = formatTime(media.duration);
    el.querySelector('.media-content').setAttribute(
      'href',
      `#wistia_${media.hashed_id}`
    );

    document.getElementById('medias').appendChild(el);
  }

  setCurrent(video) {
    const currentIndex = this.medias.findIndex((media) => {
      return media.hashed_id === video.hashedId();
    });
    this.medias[currentIndex]._played = true;

    const link = document.querySelector(`[href="#wistia_${video.hashedId()}"]`);

    Array.from(document.querySelectorAll('.currently-played')).forEach((el) => {
      if (el !== link) {
        el.classList.remove('currently-played');
      }
    });

    if (link) {
      link.classList.add('currently-played');
    }
  }

  playNext(video) {
    const unplayedMedias = this.medias.filter((media) => !media._played);
    if (unplayedMedias.length > 0) {
      video.replaceWith(unplayedMedias[0].hashed_id);
    }
  }
}

(function () {
  document.addEventListener(
    'DOMContentLoaded',
    async function () {
      const playlist = new Playlist();
      const medias = await playlist.getMedias();

      window._wq = window._wq || [];
      _wq.push({
        id: 'current_video',
        onReady(video) {
          playlist.setCurrent(video);

          video.bind('end', () => {
            playlist.playNext(video);
          });

          video.bind('beforereplace', () => {
            const currentMedia = document
              .querySelector(`[href="#wistia_${video.hashedId()}"]`)
              .closest('li');
            document.getElementById('medias').removeChild(currentMedia);
            document.getElementById('medias').appendChild(currentMedia);
            return video.unbind;
          });
        },
        options: {
          // playlistLinks: 'auto',
          silentAutoPlay: true,
          autoPlay: true,
          plugin: {
            'autoplay-countdown': {
              medias,
              src: './plugins/autoplay-countdown.js',
              from: 5,
            },
            'highlight-current': {
              src: './plugins/highlight-current.js',
            },
          },
        },
      });

      document
        .querySelector('.wistia_embed')
        .classList.add('wistia_async_' + playlist.medias[0].hashed_id);

      playlist.renderMedias();
    },
    false
  );
})();
