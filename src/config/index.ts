export const config = {
  knex: {
    client: 'postgresql',
    connection: {
      port: process.env.DB_CONN_PORT,
      host: process.env.DB_CONN_HOST,
      database: process.env.DB_CONN_DATABASE,
      user: process.env.DB_CONN_USER,
      password: process.env.DB_CONN_PASSWORD,
      multipleStatements: true,
    },
  },
}
