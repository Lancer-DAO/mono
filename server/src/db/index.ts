require("dotenv").config();
console.log(process.env.NODE_ENV)

import knex from 'knex';


export const DB = knex({
  client: 'pg',
  connection: {
    host : '0.0.0.0',
    debug:  true,
    user : 'developer',
    password : 'developer',
    database : 'developer'
  }})
