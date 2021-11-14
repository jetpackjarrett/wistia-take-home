'use strict';

import { TOKEN, formatTime } from './common.js';

class Playlist {
  constructor() {
    this.medias = [];
  }

  fetchMedias() {
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
}

(function () {
  document.addEventListener(
    'DOMContentLoaded',
    async function () {
      const playlist = new Playlist();
      await playlist.fetchMedias();
      let _init = false;
      window._wq = window._wq || [];
      _wq.push({
        id: 'current_video',

        options: {
          silentAutoPlay: true,
          autoPlay: true,
          plugin: {
            'autoplay-with-countdown': {
              medias: playlist.medias,
              src: './autoplay-with-countdown-plugin.js',
              from: 5,
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
