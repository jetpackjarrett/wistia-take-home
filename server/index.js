import Koa from 'koa';
import serve from 'koa-static';
import Router from 'koa-router';
import fetch from 'node-fetch';

import { database } from './db.js';

const app = new Koa();
const router = new Router();

async function start() {
  const db = await database();

  router.get('/medias', async (ctx) => {
    if (!ctx.query.api_password) {
      ctx.status = 403;
      ctx.body = 'No api token provided';
      return;
    }
    const url = new URL('https://api.wistia.com/v1/medias.json');
    url.searchParams.set('api_password', ctx.query.api_password);
    const apiResults = await fetch(String(url)).then((res) => res.json());
    const hashedIds = apiResults.map((res) => `'${res.hashed_id}'`).join(',');
    const dbResults = await db.get(
      `SELECT * FROM media_visibility WHERE media_id IN (${hashedIds})`
    );
    ctx.body = apiResults;
  });

  app.use(router.routes());
  app.use(serve('./client'));

  app.listen(3000);
  console.info('Server running at http://localhost:3000');
}

start();
