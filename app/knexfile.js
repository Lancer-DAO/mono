module.exports =  {
      client: 'pg',
      connection: {
        host : '34.171.131.58',
        debug:  true,
        user : 'postgres',
        password : 'lancer',
        database : 'postgres'
      },
      migrations: {
        directory: 'src/db/migrations'
      },
      seeds: {
        directory: 'src/db/seeds'
      }
    }
