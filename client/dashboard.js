'use strict';

import { fetchMedias, toggleMediaVisibility, formatTime } from './common.js';

const Dashboard = {
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
    el.setAttribute('data-is-hidden', media.hidden);

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
      const medias = await fetchMedias();
      medias.map((media) => {
        Dashboard.renderMedia(media);
      });
    },
    { useCapture: false }
  );

  document.addEventListener(
    'click',
    async function (event) {
      if (event && event.target.matches('.visibility-toggle')) {
        const container = event.target.closest('li');
        const { hashedId, isHidden } = container.dataset;
        const hidden = isHidden === 'true';
        // Optimistic update the toggle, then revert if it fails
        try {
          container.setAttribute('data-is-hidden', !hidden);
          await toggleMediaVisibility(hashedId, !hidden);
        } catch (err) {
          console.error(err);
          container.setAttribute('data-is-hidden', hidden);
          alert('Unable to update the media');
        }
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
