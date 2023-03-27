require("dotenv").config();
console.log(process.env.NODE_ENV)

import knex from 'knex';


export const DB = knex(
  {
    client: 'pg',

    connection: {
      host : '34.70.117.106',
      debug:  true,
      user : 'postgres',
      password : 'demo',
      database : 'postgres'
    }
  }
)
