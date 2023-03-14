require("dotenv").config();
console.log(process.env.NODE_ENV)

import knex from 'knex';


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
