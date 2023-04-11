require("dotenv").config();
console.log(process.env.NODE_ENV)

import knex from 'knex';


export const DB = knex(
  {
    client: 'pg',

    connection: {
      host : '34.171.131.58',
      debug:  true,
      user : 'postgres',
      password : 'lancer',
      database : 'postgres'
    }
  }
)
