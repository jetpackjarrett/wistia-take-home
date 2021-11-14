'use strict';

import { TOKEN, formatTime } from './common.js';

const Dashboard = {
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
  },

  renderTag(mediaEl, tag) {
    const template = document.getElementById('tag-template');
    const clone = template.content.cloneNode(true);
    const tagEl = clone.children[0];

    tagEl.innerText = tag;
    mediaEl.querySelector('.tags').append(tagEl);
  },

  renderTags(mediaEl, tags) {
    tags.forEach((tag) => {
      Dashboard.renderTag(mediaEl, tag);
    });
  },

  renderMedia(media) {
    const template = document.getElementById('media-template');
    const clone = template.content.cloneNode(true);
    const el = clone.children[0];

    el.querySelector('.thumbnail').setAttribute('src', media.thumbnail.url);
    el.querySelector('.title').innerText = media.name;
    el.querySelector('.duration').innerText = formatTime(media.duration);
    el.querySelector('.count').innerText = '?';
    el.setAttribute('data-hashed-id', media.hashed_id);

    this.renderTags(el, ['tag-1', 'tag-2']);

    document.getElementById('medias').appendChild(el);
  },

  openModal() {
    document.querySelector('.modal').classList.add('modal--open');
  },

  closeModal() {
    document.querySelector('.modal').classList.remove('modal--open');
  },

  addTag() {
    const el = document.createElement('li');
    el.querySelector('.tags').appendChild(el);
  },
};

(function () {
  document.addEventListener(
    'DOMContentLoaded',
    async function () {
      const medias = await Dashboard.fetchMedias();
      medias.map((media) => {
        Dashboard.renderMedia(media);
      });
    },
    { useCapture: false }
  );

  document.addEventListener(
    'click',
    function (event) {
      if (event && event.target.matches('.visibility-toggle')) {
        /* toggle visibility */
      }

      if (event && event.target.matches('.tag-button')) {
        Dashboard.openModal();
      }

      if (event && event.target.matches('.modal__button--close')) {
        Dashboard.closeModal();
      }
    },
    { useCapture: true }
  );
})();
