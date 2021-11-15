import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export async function database() {
  const db = await open({
    filename: './visibility.sqlite3',
    driver: sqlite3.cached.Database,
  });

  await db.exec(`CREATE TABLE IF NOT EXISTS media_visibility (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    media_id CHAR(10),
    is_visible BOOLEAN
  )`);

  await db.exec(`CREATE TABLE IF NOT EXISTS test (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      test CHAR(10)
  )`);
  await db.exec('INSERT INTO test (test) VALUES ("foobarbaz")');

  return db;
}
