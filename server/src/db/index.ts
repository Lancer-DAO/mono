require("dotenv").config();

import { Pool } from "pg";
import _pgp from "pg-promise";
import knex from 'knex';

const pool = new Pool();
const pgp = _pgp();

export const DB = knex({
  client: 'pg',
  connection: {
    host : '/cloudsql/lancer-api-375702:us-central1:dev-lancer-db',
    debug:  true,
    user : 'postgres',
    password : 'developer',
    database : 'postgres'
  }
})
