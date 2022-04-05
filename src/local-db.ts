import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { existsSync } from "fs";

type DbInstance = Awaited<ReturnType<typeof open>>;

export async function createLocalDb(options: {
  filename: string;
  migrate: (db: DbInstance) => Promise<void>;
}) {
  let db: DbInstance;

  const exists = existsSync(options.filename);

  db = await open({
    filename: options.filename,
    mode: sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    driver: sqlite3.Database,
  });

  if (!exists) {
    await options.migrate(db);
  }

  return db;
}

export type LocalDbInstance = Awaited<ReturnType<typeof createLocalDb>>;
