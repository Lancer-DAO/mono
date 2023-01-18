require("dotenv").config({
  path: __dirname + `/./../../.env.dev`,
  debug: true,
});

import { Pool } from "pg";
import _pgp from "pg-promise";

const pool = new Pool();
const pgp = _pgp();

export const DB = {
  async query(text: string, params?: any[]) {
    const res = await pool.query(text, params);
    return res;
  },
  async getClient() {
    const client = await pool.connect();
    return client;
  },
  pgp,
};
