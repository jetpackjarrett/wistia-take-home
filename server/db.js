import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export async function database() {
  const db = await open({
    filename: './visibility.sqlite3',
    driver: sqlite3.cached.Database,
  });

  await db.exec(`CREATE TABLE IF NOT EXISTS hidden_medias (
    media_id CHAR(10) PRIMARY KEY
  )`);

  return db;
}
