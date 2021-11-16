'use strict';

import { formatTime, fetchMedias } from './common.js';

class Playlist {
  constructor() {
    this.medias = [];
  }

  fetchMedias() {
    return fetchMedias().then((json) => {
      this.medias = json.filter((media) => {
        return !media.hidden;
      });
      return this.medias;
    });
  }

  renderMedias() {
    this.medias.forEach(this.renderMedia);
    document
      .querySelector('.wistia_embed')
      .classList.add('wistia_async_' + this.medias[0].hashed_id);
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

      playlist.renderMedias();
    },
    false
  );
})();
