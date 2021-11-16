'use strict';

export const formatTime = (total) => {
  let minutes = 0;
  let seconds = 0;

  if (total > 0) {
    minutes += Math.floor(total / 60);
    total %= 60;
  }

  seconds = Math.round(total);

  if (seconds == 60) {
    minutes += 1;
    seconds = 0;
  }

  return `${minutes}:${String(seconds).padStart(2, '0')}`;
};

// READ-ONLY TOKEN
export const TOKEN =
  'be21195231d946b680453e48456d6e806a34c0456b8c13804aa797cb2c560db1';

export function fetchMedias() {
  const url = '/medias?api_password=' + TOKEN;
  return fetch(url).then((res) => {
    if (res.ok) {
      return res.json();
    }

    throw new Error('Unable to fetch media');
  });
}

export function toggleMediaVisibility(id, hide = true) {
  const action = hide ? 'hide' : 'unhide';
  return fetch(`/medias/${id}/${action}`, {
    method: 'PUT',
  }).then((res) => {
    if (res.ok) {
      return res.text();
    }

    throw new Error('Unable to toggle media');
  });
}
